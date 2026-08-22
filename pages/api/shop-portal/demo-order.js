// pages/api/shop-portal/demo-order.js
// Creates a sample local_queue ticket so the shop can train without live sales
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function authed(req) {
  const password = process.env.SHOP_PORTAL_PASSWORD;
  if (!password) return false;
  return (req.headers["x-shop-password"] || "") === password;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }
  if (!process.env.SHOP_PORTAL_PASSWORD) {
    return res.status(503).json({ error: "SHOP_PORTAL_PASSWORD not set" });
  }
  if (!authed(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const id = `demo_${Date.now()}`;
  const now = new Date().toISOString();

  const row = {
    stripe_session_id: id,
    status: "paid",
    customer_email: "demo.customer@example.com",
    customer_name: "Demo Customer",
    amount_total: 3200,
    currency: "usd",
    ship_name: "Demo Customer",
    ship_line1: "123 Main Street",
    ship_line2: null,
    ship_city: "Brainerd",
    ship_state: "MN",
    ship_postal: "56401",
    ship_country: "US",
    shipping_address: {
      name: "Demo Customer",
      address1: "123 Main Street",
      city: "Brainerd",
      state_code: "MN",
      country_code: "US",
      zip: "56401",
    },
    fulfillment_status: "local_queue",
    items: [
      {
        description: "DEMO — Grit & Grace Tee (M / Black)",
        quantity: 1,
        amount_total: 2800,
        currency: "usd",
      },
      {
        description: "DEMO — Shipping",
        quantity: 1,
        amount_total: 400,
        currency: "usd",
      },
    ],
    updated_at: now,
  };

  const { error } = await supabase.from("orders").upsert(row, {
    onConflict: "stripe_session_id",
  });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, stripe_session_id: id });
}
