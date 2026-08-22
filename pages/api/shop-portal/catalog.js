// pages/api/shop-portal/catalog.js — shop-visible local catalog
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
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }
  if (!process.env.SHOP_PORTAL_PASSWORD) {
    return res.status(503).json({ error: "SHOP_PORTAL_PASSWORD not set" });
  }
  if (!authed(req)) return res.status(401).json({ error: "Unauthorized" });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const activeOnly = (req.query.active || "1").toString() !== "0";

  let q = supabase
    .from("local_catalog")
    .select(
      "id, sku, title, description, category, blank_type, colors, sizes, print_file_url, mockup_url, base_cost_cents, active, notes, updated_at"
    )
    .order("title", { ascending: true });

  if (activeOnly) q = q.eq("active", true);

  const { data, error } = await q;

  if (error) {
    // Table might not exist yet
    console.error(error);
    return res.status(200).json({
      items: [],
      warning:
        error.message?.includes("local_catalog") || error.code === "42P01"
          ? "Run docs/VENDOR-CATALOG.md SQL to create local_catalog"
          : error.message,
    });
  }

  return res.status(200).json({ items: data || [] });
}
