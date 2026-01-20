// pages/api/webhooks/stripe.js
import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto'; // ← Added for safe external_id

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

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
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
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

function generateSafeExternalId(sessionId) {
  // Creates a short, valid, deterministic ID: max 16 chars, only allowed characters
  const hash = crypto
    .createHash('sha256')
    .update(sessionId)
    .digest('hex')
    .slice(0, 12);
  return `ord_${hash}`;
}

function looksLikeShipping(lineItem, productName, nickname) {
  const hay = `${lineItem?.description || ""} ${productName || ""} ${nickname || ""}`.toLowerCase();
  return hay.includes("shipping");
}

export default async function handler(req, res) {
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

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object;

  if (session.payment_status !== "paid") {
    console.warn("⚠️ Session completed but not paid:", session.id);
    return res.status(200).json({ received: true, message: "Not paid" });
  }

  try {
    // Recipient
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

    // Line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ["data.price", "data.price.product"],
    });

    // Save main order
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
      fulfillment_status: 'pending', // ← Default value
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: orderError } = await supabase
      .from("orders")
      .upsert(orderRow, { onConflict: "stripe_session_id" });

    if (orderError) console.error("❌ Supabase orders upsert failed:", orderError);

    // Build order_items + fallback Printful mapping
    const orderItems = [];
    const printfulItemsFromStripe = [];

    for (const li of lineItems.data || []) {
      const qty = Number(li.quantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const priceObj = li.price;
      if (!priceObj || typeof priceObj !== "object") continue;

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

    if (orderItems.length) {
      const { error: itemsError } = await supabase
        .from("order_items")
        .upsert(orderItems, { onConflict: "stripe_session_id,sku" });

      if (itemsError) console.error("❌ Supabase order_items upsert failed:", itemsError);
    }

    // Prefer session metadata → fallback to Stripe metadata
    const printfulItemsFromMeta = parsePrintfulItemsFromSession(session);
    const printfulItems = printfulItemsFromMeta.length > 0 ? printfulItemsFromMeta : printfulItemsFromStripe;

    // Early return if no Printful token
    if (!process.env.PRINTFUL_ACCESS_TOKEN) {
      console.warn("⚠️ PRINTFUL_ACCESS_TOKEN missing — skipping fulfillment");
      await supabase.from("orders").upsert({
        stripe_session_id: session.id,
        fulfillment_status: "skipped_no_printful_token",
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" });
      return res.status(200).json({ success: true, fulfillment: "skipped" });
    }

    // No items → mark as needs mapping
    if (!printfulItems.length) {
      console.warn("⚠️ No Printful items found — skipping fulfillment");
      await supabase.from("orders").upsert({
        stripe_session_id: session.id,
        fulfillment_status: "needs_mapping",
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" });
      return res.status(200).json({ success: true, fulfillment: "needs_mapping" });
    }

    // Validate required recipient fields
    if (!recipient.name || !recipient.address1 || !recipient.city || !recipient.country_code || !recipient.zip) {
      console.error("❌ Missing required shipping info — skipping");
      await supabase.from("orders").upsert({
        stripe_session_id: session.id,
        fulfillment_status: "skipped_missing_shipping",
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" });
      return res.status(200).json({ success: true, fulfillment: "skipped_missing_shipping" });
    }

    // Create Printful order with SAFE external_id
    //const safeExternalId = generateSafeExternalId(session.id);
    //console.log(`Creating Printful order | external_id: ${safeExternalId} | items: ${JSON.stringify(printfulItems)}`);

    const printfulRes = await fetch("https://api.printful.com/orders?update_existing=true", {  // ← Added update_existing for safety
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        //external_id: safeExternalId,          
        recipient,
        items: printfulItems,
        confirm: true,
        shipping: "STANDARD",
      }),
    });

    const printfulData = await printfulRes.json();

    if (printfulRes.status === 409) {
      console.warn("⚠️ Printful duplicate detected (already exists)");
      await supabase.from("orders").upsert({
        stripe_session_id: session.id,
        fulfillment_status: "duplicate",
        printful_response: safeJson(printfulData),
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" });
      return res.status(200).json({ success: true, duplicate: true });
    }

    if (![200, 201].includes(printfulRes.status)) {
      console.error("❌ Printful failed:", { status: printfulRes.status, data: printfulData });
      await supabase.from("orders").upsert({
        stripe_session_id: session.id,
        fulfillment_status: "failed",
        printful_response: safeJson(printfulData),
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" });
      return res.status(200).json({ success: true, fulfillment: "failed" });
    }

    console.log("✅ Printful order created:", printfulData?.result?.id);

    await supabase.from("orders").upsert({
      stripe_session_id: session.id,
      fulfillment_status: "created",
      printful_order_id: printfulData?.result?.id ?? null,
      printful_response: safeJson(printfulData),
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_session_id" });

    return res.status(200).json({ success: true, fulfillment: "created" });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    try {
      await supabase.from("orders").upsert({
        stripe_session_id: session?.id ?? null,
        fulfillment_status: "error",
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_session_id" });
    } catch {}
    return res.status(200).json({ success: true, error: "handled" });
  }
}
