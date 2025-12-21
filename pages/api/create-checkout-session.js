// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

function clean(v) {
  return (v ?? "").toString().trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { cart, address, shippingRate } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    // Shipping MUST be selected (from Printful rates)
    if (!shippingRate || !shippingRate.id || !shippingRate.rate) {
      return res.status(400).json({
        error: "Shipping missing/invalid. Please calculate and select an option first.",
      });
    }

    const shippingCents = Math.round(Number(shippingRate.rate) * 100);
    if (!Number.isFinite(shippingCents) || shippingCents <= 0) {
      return res.status(400).json({
        error: "Shipping missing/invalid. Please calculate and select an option first.",
      });
    }

    // Build Stripe line items using EXISTING Stripe Prices (best)
    // Your cart items should already include sku and/or stripe_price_id.
    // If not, we'll fall back to price_data.
    const line_items = cart.map((item) => {
      const qty = Number(item.quantity || 1);
      if (!qty || qty <= 0) throw new Error("Invalid quantity in cart");

      // Preferred: use Stripe price id if you have it
      if (item.stripe_price_id) {
        return { price: item.stripe_price_id, quantity: qty };
      }

      // Fallback: create ad-hoc price_data (works, but won't have price metadata)
      // If you use this fallback, your webhook MUST use session.metadata.printful_items.
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: clean(item.name) || "Item",
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: qty,
      };
    });

    // Add shipping as separate line item (so customer sees it)
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Shipping (${clean(shippingRate.name) || "Standard"})`,
        },
        unit_amount: shippingCents,
      },
      quantity: 1,
    });

    // Put Printful items + chosen shipping in session metadata
    const printful_items = cart.map((item) => ({
      sync_variant_id: Number(item.sync_variant_id),
      quantity: Number(item.quantity || 1),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },

      line_items,

      metadata: {
        printful_items: JSON.stringify(printful_items),
        printful_shipping_id: clean(shippingRate.id),
        printful_shipping_name: clean(shippingRate.name),
        printful_shipping_rate: clean(shippingRate.rate),
      },

      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
