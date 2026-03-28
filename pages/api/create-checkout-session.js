// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

function clean(v) {
  return (v ?? "").toString().trim();
}

function getRequestOrigin(req) {
  const explicit =
    clean(process.env.NEXT_PUBLIC_SITE_URL) ||
    clean(process.env.SITE_URL) ||
    clean(req.headers.origin);

  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      // keep going
    }
  }

  const host = clean(req.headers["x-forwarded-host"] || req.headers.host);
  const proto = clean(req.headers["x-forwarded-proto"]) || "https";

  if (host) {
    try {
      return new URL(`${proto}://${host}`).origin;
    } catch {
      // keep going
    }
  }

  throw new Error("Could not determine site origin for Stripe redirect URLs.");
}

function getValidStripeImage(url) {
  const value = clean(url);
  if (!value) return null;

  if (
    value.includes("REPLACE_WITH_REAL_THUMB_URL") ||
    value === "null" ||
    value === "undefined"
  ) {
    return null;
  }

  if (!/^https?:\/\//i.test(value)) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart, shippingRate } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }

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

    const line_items = cart.map((item) => {
      const qty = Number(item.quantity || 1);
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error("Invalid quantity in cart");
      }

      if (item.stripe_price_id) {
        return {
          price: item.stripe_price_id,
          quantity: qty,
        };
      }

      const unitAmount = Math.round(Number(item.price) * 100);
      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        throw new Error(`Invalid price for item: ${clean(item.name) || "Item"}`);
      }

      const validImage = getValidStripeImage(item.image);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: clean(item.name) || "Item",
            ...(validImage ? { images: [validImage] } : {}),
          },
          unit_amount: unitAmount,
        },
        quantity: qty,
      };
    });

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

    const printful_items = cart.map((item) => ({
      sync_variant_id: Number(item.sync_variant_id),
      quantity: Number(item.quantity || 1),
    }));

    const origin = getRequestOrigin(req);

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
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
