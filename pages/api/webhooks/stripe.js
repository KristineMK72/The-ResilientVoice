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
  // PRINTFUL_ACCESS_TOKEN optional (we can skip fulfillment if missing)
  return { ok: missing.length === 0, missing };
}

function parsePrintfulItemsFromSession(session) {
  const raw = session?.metadata?.printful_items;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((i) => ({
        sync_variant_id: Number(i?.sync_variant_id),
        quantity: Number(i?.quantity),
      }))
      .filter(
        (i) =>
          Number.isFinite(i.sync_variant_id) &&
          i.sync_variant_id > 0 &&
          Number.isFinite(i.quantity) &&
          i.quantity > 0
      );
  } catch (e) {
    console.warn("⚠️ Failed to parse session.metadata.printful_items:", e.message);
    return [];
  }
}

function looksLikeShipping(lineItem, productName, nickname) {
  const hay = `${lineItem?.description || ""} ${productName || ""} ${nickname || ""}`.toLowerCase();
  return hay.includes("shipping");
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

    // 5) Save ORDER to Supabase (ALWAYS)
    const orderRow = {
      stripe_session_id: session.id,
      email: clean(customer.email) || null,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      payment_status: session.payment_status ?? null,
      stripe_customer_id: session.customer ?? null,
      shipping_name: recipient.name || null,
      shipping_address: safeJson(recipient),
      stripe_payment_intent: session.payment_intent ?? null,
      stripe_mode: session.mode ?? null,
      fulfillment_status: null, // will be set below
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: orderError } = await supabase
      .from("orders")
      .upsert(orderRow, { onConflict: "stripe_session_id" });

    if (orderError) console.error("❌ Supabase orders upsert failed:", orderError);

    // 6) Build order_items rows + (backup) printful items from Stripe price/product metadata
    const orderItems = [];
    const printfulItemsFromStripe = [];

    for (const li of lineItems.data || []) {
      const qty = Number(li.quantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const priceObj = li.price;
      if (!priceObj || typeof priceObj !== "object") {
        console.warn("⚠️ Missing expanded price object for line item; skipping.");
        continue;
      }

      const productObj =
        priceObj.product && typeof priceObj.product === "object"
          ? priceObj.product
          : priceObj.product
          ? await stripe.products.retrieve(priceObj.product)
          : null;

      const priceMeta = priceObj.metadata || {};
      const productMeta = productObj?.metadata || {};

      const productName =
        (productObj?.name ? clean(productObj.name) : "") ||
        clean(priceObj.nickname) ||
        clean(li.description) ||
        "Unknown";

      const nickname = clean(priceObj.nickname || "");

      // Skip shipping “product” lines in your order_items table
      if (looksLikeShipping(li, productName, nickname)) continue;

      const sku = clean(
        priceObj.lookup_key ||
          priceMeta.printful_sku ||
          priceMeta.sku ||
          productMeta.printful_sku ||
          productMeta.sku ||
          ""
      );

      const syncVariantIdRaw = clean(
        priceMeta.printful_sync_variant_id ||
          productMeta.printful_sync_variant_id ||
          priceMeta.sync_variant_id ||
          productMeta.sync_variant_id ||
          ""
      );

      orderItems.push({
        stripe_session_id: session.id,
        sku: sku || null,
        product_name: productName,
        quantity: qty,
        unit_amount: priceObj.unit_amount ?? null,
        currency: priceObj.currency ?? session.currency ?? null,
        printful_sync_variant_id: syncVariantIdRaw || null,
      });

      if (syncVariantIdRaw) {
        const sync_variant_id = Number(syncVariantIdRaw);
        if (Number.isFinite(sync_variant_id) && sync_variant_id > 0) {
          printfulItemsFromStripe.push({ sync_variant_id, quantity: qty });
        }
      }
    }

    // ✅ Upsert order_items (requires unique constraint on stripe_session_id, sku OR some id)
    // If you don’t have that constraint yet, change this to .insert(orderItems)
    if (orderItems.length) {
      const { error: itemsError } = await supabase
        .from("order_items")
        .upsert(orderItems, { onConflict: "stripe_session_id,sku" });

      if (itemsError) {
        console.error("❌ Supabase order_items upsert failed:", itemsError);
      }
    }

    // 7) BEST SOURCE: Printful items from session metadata (works for both price_id and price_data paths)
    const printfulItemsFromMeta = parsePrintfulItemsFromSession(session);

    // Prefer metadata; fallback to Stripe-derived mapping if missing
    const printfulItems =
      printfulItemsFromMeta.length > 0 ? printfulItemsFromMeta : printfulItemsFromStripe;

    // 8) If Printful token missing, skip fulfillment (order is still stored)
    if (!process.env.PRINTFUL_ACCESS_TOKEN) {
      console.warn("⚠️ PRINTFUL_ACCESS_TOKEN missing — fulfillment skipped:", session.id);

      await supabase.from("orders").upsert(
        {
          stripe_session_id: session.id,
          fulfillment_status: "skipped_no_printful_token",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );

      return res.status(200).json({ success: true, fulfillment: "skipped_no_printful_token" });
    }

    // 9) If no fulfillable items, mark needs_mapping
    if (!printfulItems.length) {
      console.warn("⚠️ No Printful items resolved — fulfillment skipped:", session.id);

      await supabase.from("orders").upsert(
        {
          stripe_session_id: session.id,
          fulfillment_status: "needs_mapping",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );

      return res.status(200).json({ success: true, fulfillment: "needs_mapping" });
    }

    // 10) Validate recipient fields Printful requires
    if (
      !recipient.name ||
      !recipient.address1 ||
      !recipient.city ||
      !recipient.country_code ||
      !recipient.zip
    ) {
      console.error("❌ Missing recipient shipping details — fulfillment skipped:", session.id, recipient);

      await supabase.from("orders").upsert(
        {
          stripe_session_id: session.id,
          fulfillment_status: "skipped_missing_shipping",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );

      return res.status(200).json({ success: true, fulfillment: "skipped_missing_shipping" });
    }

    // 11) Create Printful order
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

      await supabase.from("orders").upsert(
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
      console.error("❌ Printful API error:", { status: printfulRes.status, response: printfulData });

      await supabase.from("orders").upsert(
        {
          stripe_session_id: session.id,
          fulfillment_status: "failed",
          printful_response: safeJson(printfulData),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );

      // Return 200 so Stripe doesn't retry forever; you can re-fulfill later
      return res.status(200).json({
        success: true,
        fulfillment: "failed",
        printful_status: printfulRes.status,
      });
    }

    console.log("✅ Printful order created:", printfulData?.result?.id, "session:", session.id);

    await supabase.from("orders").upsert(
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

    // Mark as errored for visibility (but still return 200 to avoid retries)
    try {
      await supabase.from("orders").upsert(
        {
          stripe_session_id: event?.data?.object?.id ?? null,
          fulfillment_status: "error",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );
    } catch {}

    return res.status(200).json({ success: true, error: "handled_error" });
  }
}
