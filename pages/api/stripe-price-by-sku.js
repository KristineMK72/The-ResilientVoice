import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export default async function handler(req, res) {
  try {
    const sku = (req.query.sku || "").toString().trim();
    if (!sku) return res.status(400).json({ error: "Missing sku" });

    const prices = await stripe.prices.list({
      lookup_keys: [sku],
      limit: 1,
    });

    const price = prices.data?.[0];
    if (!price) return res.status(404).json({ error: `No Stripe price found for sku=${sku}` });

    return res.status(200).json({ price_id: price.id });
  } catch (e) {
    console.error("stripe-price-by-sku error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
