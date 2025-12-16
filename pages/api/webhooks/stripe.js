// pages/api/webhooks/stripe.js
import Stripe from "stripe";
import { buffer } from "micro";
import fetch from "node-fetch";

// Stripe requires the raw body
export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export default async function handler(req, res) {
  // 1) Method guard
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  // 2) Verify webhook signature
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

  // 3) Only fulfill on checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    return res
      .status(200)
      .json({ received: true, message: `Ignoring ${event.type}` });
  }

  const session = event.data.object;

  // 4) Must be paid
  if (session.payment_status !== "paid") {
    console.warn("⚠️ Session completed but not paid:", session.id);
    return res.status(200).json({ received: true, message: "Not paid" });
  }

  // 5) Fulfillment
  try {
    // ✅ Recipient: prefer shipping_details; fallback to customer_details
    const shipping = session.shipping_details || {};
    const customer = session.customer_details || {};
    const addr = shipping.address || customer.address || {};

    const recipient = {
      name: shipping.name || customer.name,
      email: customer.email || undefined,
      address1: addr.line1,
      address2: addr.line2 || undefined,
      city: addr.city,
      state_code: addr.state,
      country_code: addr.country,
      zip: addr.postal_code,
    };

    if (
      !recipient.name ||
      !recipient.address1 ||
      !recipient.city ||
      !recipient.country_code ||
      !recipient.zip
    ) {
      throw new Error("Missing recipient shipping details for fulfillment.");
    }

    // ✅ REQUIRED: read Printful metadata from Checkout Session (only once)
    if (!session.metadata?.printful_items) {
      throw new Error("Missing printful_items metadata from Stripe session.");
    }

    let items;
    try {
      items = JSON.parse(session.metadata.printful_items);
    } catch {
      throw new Error("printful_items metadata is not valid JSON.");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("printful_items metadata is empty or invalid.");
    }

    // ✅ Synced Printful products: variant_id = sync_variant_id (no files needed)
    const printfulItems = items.map((item, idx) => {
      const sync_variant_id = item?.sync_variant_id;
      const quantity = Number(item?.quantity);

      if (!sync_variant_id) {
        throw new Error(`Missing sync_variant_id for item at index ${idx}.`);
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for item ${sync_variant_id}.`);
      }

      return {
        variant_id: Number(sync_variant_id), // Printful expects a number
        quantity,
      };
    });

    const printfulRes = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: session.id, // ✅ idempotency: one order per session
        recipient,
        items: printfulItems,
        confirm: true,
        shipping: "STANDARD",
      }),
    });

    const printfulData = await printfulRes.json();

    // Duplicate order (safe)
    if (printfulRes.status === 409) {
      console.warn("⚠️ Printful order already exists for session:", session.id);
      return res.status(200).json({ duplicate: true });
    }

    // Failure
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
