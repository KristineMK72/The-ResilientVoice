// pages/api/webhooks/stripe.js
import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

// Supabase (Service Role key is required for server-side inserts)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function clean(v) {
  return (v || "").toString().trim().replace(/\r/g, "");
}

function safeJson(v) {
  try {
    return v ?? null;
  } catch {
    return null;
  }
}

function envOk() {
  const missing = [];
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET");
  if (!process.env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  // PRINTFUL_ACCESS_TOKEN is optional (we can skip fulfillment if missing)
  return { ok: missing.length === 0, missing };
}

export default async function handler(req, res) {
  // Basic sanity
  const check = envOk();
  if (!check.ok) {
    console.error("❌ Missing env vars:", check.missing.join(", "));
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  // 1) Verify Stripe signature
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2) Only handle successful Checkout completions
  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object;

  if (session.payment_status !== "paid") {
    console.warn("⚠️ Session completed but not paid:", session.id);
    return res.status(200).json({ received: true, message: "Not paid" });
  }

  // We'll return 200 even if downstream steps fail, but still log errors.
  try {
    // 3) Recipient (prefer shipping_details, fallback to customer_details)
    const shipping = session.shipping_details || {};
    const customer = session.customer_details || {};
    const addr = shipping.address || customer.address || {};

    const recipient = {
      name: clean(shipping.name || customer.name),
      email: clean(customer.email) || undefined,
      address1: clean(addr.line1),
      address2: clean(addr.line2) || undefined,
      city: clean(addr.city),
      state_code: clean(addr.state),
      country_code: clean(addr.country),
      zip: clean(addr.postal_code),
    };

    // 4) Load line items (expand price & product for metadata/name)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ["data.price", "data.price.product"],
    });

    if (!lineItems.data?.length) {
      console.warn("⚠️ No line items found for session:", session.id);
    }

    // 5) Save ORDER to Supabase (ALWAYS)
    // NOTE: Adjust column names to match your tables. This assumes you have:
    // orders: stripe_session_id (unique), email, amount_total, currency, payment_status,
    //         shipping_name, shipping_address (json), stripe_customer_id, created_at
    const orderRow = {
      stripe_session_id: session.id,
      email: clean(customer.email) || null,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      payment_status: session.payment_status ?? null,
      stripe_customer_id: session.customer ?? null,
      shipping_name: recipient.name || null,
      shipping_address: safeJson(recipient),
      // optional: keep some raw stripe refs
      stripe_payment_intent: session.payment_intent ?? null,
      stripe_mode: session.mode ?? null,
      created_at: new Date().toISOString(),
    };

    const { error: orderError } = await supabase
      .from("orders")
      .upsert(orderRow, { onConflict: "stripe_session_id" });

    if (orderError) {
      console.error("❌ Supabase orders upsert failed:", orderError);
      // continue
    }

    // 6) Save ORDER ITEMS to Supabase (ALWAYS)
    // NOTE: Adjust to your schema. This assumes order_items has:
    // stripe_session_id, sku, product_name, quantity, unit_amount, currency, printful_sync_variant_id
    const orderItems = [];
    const printfulItems = [];

    for (const li of lineItems.data || []) {
      const qty = Number(li.quantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const priceObj =
        li.price && typeof li.price === "object"
          ? li.price
          : await stripe.prices.retrieve(li.price);

      const meta = priceObj.metadata || {};

      const sku = clean(meta.printful_sku || meta.sku || "");
      const productName =
        (priceObj.product && typeof priceObj.product === "object"
          ? priceObj.product.name
          : "") ||
        clean(priceObj.nickname) ||
        "Unknown";

      orderItems.push({
        stripe_session_id: session.id,
        sku: sku || null,
        product_name: productName,
        quantity: qty,
        unit_amount: priceObj.unit_amount ?? null,
        currency: priceObj.currency ?? session.currency ?? null,
        printful_sync_variant_id: meta.printful_sync_variant_id
          ? clean(meta.printful_sync_variant_id)
          : null,
      });

      // Build Printful items only if we have a valid sync_variant_id
      const syncVariantIdRaw = meta.printful_sync_variant_id;
      if (syncVariantIdRaw) {
        const sync_variant_id = Number(clean(syncVariantIdRaw));
        if (Number.isFinite(sync_variant_id)) {
          printfulItems.push({ sync_variant_id, quantity: qty });
        } else {
          console.warn(
            `⚠️ Invalid printful_sync_variant_id "${syncVariantIdRaw}" on Stripe price ${priceObj.id}`
          );
        }
      } else {
        const nick = clean(priceObj.nickname || "");
        console.warn(
          `⚠️ Missing printful_sync_variant_id on Stripe price ${priceObj.id} (sku=${sku} nickname=${nick})`
        );
      }
    }

    if (orderItems.length) {
      // If you want idempotency here, consider:
      // - making (stripe_session_id, sku) unique and using upsert
      // For now we insert; if you re-run the webhook, you may duplicate rows.
      // If you already added uniques, swap to upsert({onConflict:"stripe_session_id,sku"}).
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("❌ Supabase order_items insert failed:", itemsError);
        // continue
      }
    }

    // 7) If Printful token missing, skip fulfillment (order is still stored)
    if (!process.env.PRINTFUL_ACCESS_TOKEN) {
      console.warn(
        "⚠️ PRINTFUL_ACCESS_TOKEN missing — order saved, fulfillment skipped:",
        session.id
      );
      return res.status(200).json({
        success: true,
        fulfillment: "skipped_no_printful_token",
      });
    }

    // 8) If no fulfillable items, skip fulfillment (order is still stored)
    if (!printfulItems.length) {
      console.warn(
        "⚠️ No fulfillable Printful items — order saved, fulfillment skipped:",
        session.id
      );
      return res.status(200).json({
        success: true,
        fulfillment: "skipped_no_variant_ids",
      });
    }

    // 9) Validate recipient fields Printful requires
    // (Printful needs name, address1, city, country_code, zip; state often required for US)
    if (
      !recipient.name ||
      !recipient.address1 ||
      !recipient.city ||
      !recipient.country_code ||
      !recipient.zip
    ) {
      console.error(
        "❌ Missing recipient shipping details — fulfillment skipped:",
        session.id,
        recipient
      );
      return res.status(200).json({
        success: true,
        fulfillment: "skipped_missing_shipping",
      });
    }

    // 10) Create Printful order
    const printfulRes = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: session.id, // idempotency: one Printful order per Stripe session
        recipient,
        items: printfulItems,
        confirm: true,
        shipping: "STANDARD",
      }),
    });

    const printfulData = await printfulRes.json();

    // Printful returns 409 if external_id already used
    if (printfulRes.status === 409) {
      console.warn("⚠️ Printful order already exists for session:", session.id);

      // Optional: store fulfillment status in Supabase
      await supabase
        .from("orders")
        .upsert(
          {
            stripe_session_id: session.id,
            fulfillment_status: "duplicate",
            printful_response: safeJson(printfulData),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_session_id" }
        );

      return res.status(200).json({ success: true, duplicate: true });
    }

    if (![200, 201].includes(printfulRes.status)) {
      console.error("❌ Printful API error:", {
        status: printfulRes.status,
        response: printfulData,
      });

      // Optional: store fulfillment error in Supabase
      await supabase
        .from("orders")
        .upsert(
          {
            stripe_session_id: session.id,
            fulfillment_status: "failed",
            printful_response: safeJson(printfulData),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_session_id" }
        );

      // Return 200 so Stripe doesn't retry forever (since you can re-fulfill later)
      return res.status(200).json({
        success: true,
        fulfillment: "failed",
        printful_status: printfulRes.status,
      });
    }

    console.log(
      "✅ Printful order created:",
      printfulData?.result?.id,
      "session:",
      session.id
    );

    // Optional: store fulfillment success in Supabase
    await supabase
      .from("orders")
      .upsert(
        {
          stripe_session_id: session.id,
          fulfillment_status: "created",
          printful_order_id: printfulData?.result?.id ?? null,
          printful_response: safeJson(printfulData),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );

    return res.status(200).json({ success: true, fulfillment: "created" });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);

    // Return 200 to prevent Stripe retries (your order may still have been captured)
    return res.status(200).json({ success: true, error: "handled_error" });
  }
}
