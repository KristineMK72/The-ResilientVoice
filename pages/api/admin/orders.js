// pages/api/admin/orders.js — recent orders for /admin/orders
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function authed(req) {
  const password = process.env.ADMIN_PASSWORD || process.env.SHOP_PORTAL_PASSWORD;
  if (!password) return false;
  return (req.headers["x-admin-password"] || "") === password;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }
  if (!process.env.ADMIN_PASSWORD && !process.env.SHOP_PORTAL_PASSWORD) {
    return res.status(503).json({
      error: "Set ADMIN_PASSWORD (or SHOP_PORTAL_PASSWORD) in Vercel",
    });
  }
  if (!authed(req)) return res.status(401).json({ error: "Unauthorized" });

  const limit = Math.min(Number(req.query.limit) || 25, 100);

  const { data, error } = await supabase
    .from("orders")
    .select(
      "stripe_session_id, customer_name, customer_email, amount_total, currency, fulfillment_status, ship_name, ship_city, ship_state, ship_country, items, tracking_number, updated_at, created_at"
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ orders: data || [] });
}
