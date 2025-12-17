// pages/api/webhooks/stripe.js
import Stripe from "stripe";
import { buffer } from "micro";

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

function clean(v) {
  return (v || "").toString().trim().replace(/\r/g, "");
}

export default async function handler(req, res) {
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

  // 2) Only fulfill on checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object;

  if (session.payment_status !== "paid") {
    console.warn("⚠️ Session completed but not paid:", session.id);
    return res.status(200).json({ received: true, message: "Not paid" });
  }

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

    if (
      !recipient.name ||
      !recipient.address1 ||
      !recipient.city ||
      !recipient.country_code ||
      !recipient.zip
    ) {
      throw new Error(
        "Missing recipient shipping details (name/address/city/country/zip)."
      );
    }

    // 4) Load line items (this is the key change)
    // Expand price so we can read price.metadata without extra API calls
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ["data.price", "data.price.product"],
    });

    if (!lineItems.data?.length) {
      throw new Error("No line items found for session.");
    }

    // 5) Build Printful items from Stripe price metadata
    const printfulItems = [];
    for (const li of lineItems.data) {
      const qty = Number(li.quantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      // li.price is expanded; fallback if it isn't
      const priceObj =
        li.price && typeof li.price === "object"
          ? li.price
          : await stripe.prices.retrieve(li.price);

      const meta = priceObj.metadata || {};
      const syncVariantIdRaw = meta.printful_sync_variant_id;

      if (!syncVariantIdRaw) {
        // Helpful debug info
        const sku = clean(meta.printful_sku || meta.sku || "");
        const nick = clean(priceObj.nickname || "");
        console.warn(
          `⚠️ Missing printful_sync_variant_id on Stripe price ${priceObj.id} (sku=${sku} nickname=${nick})`
        );
        continue;
      }

      const sync_variant_id = Number(clean(syncVariantIdRaw));
      if (!Number.isFinite(sync_variant_id)) {
        console.warn(
          `⚠️ Invalid printful_sync_variant_id "${syncVariantIdRaw}" on Stripe price ${priceObj.id}`
        );
        continue;
      }

      printfulItems.push({
        sync_variant_id,
        quantity: qty,
      });
    }

    if (!printfulItems.length) {
      throw new Error(
        "No fulfillable items found. (Likely missing printful_sync_variant_id metadata on Stripe prices.)"
      );
    }

    // 6) Create Printful order
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
      return res.status(200).json({ duplicate: true });
    }

    if (![200, 201].includes(printfulRes.status)) {
      console.error("❌ Printful API error:", {
        status: printfulRes.status,
        response: printfulData,
      });
      return res
        .status(500)
        .json({ error: "Printful order failed", details: printfulData });
    }

    console.log(
      "✅ Printful order created:",
      printfulData?.result?.id,
      "session:",
      session.id
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Fulfillment error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
