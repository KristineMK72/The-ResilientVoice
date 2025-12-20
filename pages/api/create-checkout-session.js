// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

function clean(v) {
  return (v || "").toString().trim().replace(/\r/g, "");
}

async function findPriceByLookupKey(lookupKey) {
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  });
  return prices.data?.[0] || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { cart, shippingCost, shippingOption, address } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    // shippingCost should be the selected Printful rate (number)
    const ship = Number(shippingCost);
    if (!Number.isFinite(ship) || ship <= 0) {
      return res.status(400).json({
        error: 'Shipping cost missing/invalid. Please calculate shipping and select an option first.',
      });
    }

    // Optional address info (we don’t *need* it to create the session because Stripe collects it,
    // but saving it can help debugging)
    const safeAddress = address
      ? {
          name: clean(address.name),
          address1: clean(address.address1),
          city: clean(address.city),
          state_code: clean(address.state_code),
          country_code: clean(address.country_code || "US"),
          zip: clean(address.zip),
        }
      : null;

    /* -------------------------
       Build Stripe Line Items
       IMPORTANT:
       Use existing Stripe Price objects (so we keep metadata like printful_sync_variant_id)
    -------------------------- */
    const line_items = [];

    for (const item of cart) {
      const qty = Number(item.quantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      // BEST: item.stripe_price_id already stored in cart
      let priceId = item.stripe_price_id || item.price_id || null;

      // FALLBACK: SKU -> find Stripe price by lookup_key
      if (!priceId) {
        const sku = clean(item.sku || item.printful_sku || "");
        if (!sku) {
          return res.status(400).json({
            error:
              "Cart items must include stripe_price_id or sku so we can map to Stripe Price.",
          });
        }

        const price = await findPriceByLookupKey(sku);
        if (!price) {
          return res.status(400).json({
            error: `No Stripe price found for SKU (lookup_key) = ${sku}`,
          });
        }
        priceId = price.id;
      }

      line_items.push({
        price: priceId,
        quantity: qty,
      });
    }

    if (!line_items.length) {
      return res.status(400).json({ error: "No valid line items found in cart." });
    }

    // Add shipping as a custom line item (in cents)
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: shippingOption?.name
            ? `Shipping (${clean(shippingOption.name)})`
            : "Shipping",
        },
        unit_amount: Math.round(ship * 100),
      },
      quantity: 1,
    });

    // Light metadata only (Stripe metadata has limits)
    // We do NOT store the whole cart here; your webhook already reads line items + price metadata.
    const metadata = {
      shipping_cost: String(ship.toFixed(2)),
      shipping_name: clean(shippingOption?.name || "Shipping"),
      shipping_id: clean(shippingOption?.id || ""),
    };

    // Optional: keep a tiny reference list (IDs only)
    // (Don’t shove huge JSON in metadata)
    metadata.item_count = String(cart.length);

    if (safeAddress?.zip) metadata.ship_zip = safeAddress.zip;
    if (safeAddress?.state_code) metadata.ship_state = safeAddress.state_code;
    if (safeAddress?.country_code) metadata.ship_country = safeAddress.country_code;

    const origin =
      req.headers.origin ||
      `https://${req.headers.host}`; // fallback

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      // Stripe collects the actual shipping address
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },

      line_items,

      // ✅ this is what your fulfillment webhook expects (it reads line items and price.metadata)
      // metadata is just extra info
      metadata,

      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
