// pages/api/get-checkout-session.js
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session_id = req.query.session_id;
  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    // 1) Get session from Stripe (includes metadata)
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // 2) Get line items (helps you verify cart vs shipping line)
    const lineItems = await stripe.checkout.sessions.listLineItems(session_id, {
      limit: 100,
      expand: ["data.price", "data.price.product"],
    });

    // 3) Get fulfillment info from Supabase (what your webhook wrote)
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .select(
        "stripe_session_id, fulfillment_status, printful_order_id, printful_response, updated_at"
      )
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (orderErr) {
      console.warn("⚠️ Supabase orders lookup failed:", orderErr);
    }

    // 4) Parse Printful items from metadata for easy visibility
    const printful_items = session?.metadata?.printful_items
      ? safeParseJson(session.metadata.printful_items)
      : null;

    return res.status(200).json({
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_details: session.customer_details,
      shipping_details: session.shipping_details,
      metadata: session.metadata,

      // The exact list your webhook should send to Printful
      printful_items,

      // Helpful debug view of what Stripe thinks was purchased
      line_items: (lineItems?.data || []).map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unit_amount: li.price?.unit_amount ?? null,
        currency: li.price?.currency ?? null,
        lookup_key: li.price?.lookup_key ?? null,
        price_id: li.price?.id ?? null,
        product_name:
          (li.price?.product &&
            typeof li.price.product === "object" &&
            li.price.product?.name) ||
          null,
        price_metadata: li.price?.metadata ?? null,
        product_metadata:
          (li.price?.product &&
            typeof li.price.product === "object" &&
            li.price.product?.metadata) ||
          null,
      })),

      // What actually happened server-side
      fulfillment: orderRow
        ? {
            fulfillment_status: orderRow.fulfillment_status,
            printful_order_id: orderRow.printful_order_id,
            updated_at: orderRow.updated_at,
            printful_response: orderRow.printful_response ?? null,
          }
        : null,
    });
  } catch (err) {
    console.error("❌ Error retrieving session:", err);
    return res.status(500).json({ error: err.message });
  }
}
