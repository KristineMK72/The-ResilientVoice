// pages/api/vendor/catalog.js — manage / list local vendor catalog
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function adminOk(req) {
  const key =
    process.env.VENDOR_ADMIN_PASSWORD || process.env.SHOP_PORTAL_PASSWORD;
  if (!key) return false;
  return (req.headers["x-vendor-admin-password"] || "") === key;
}

export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (req.method === "GET") {
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
      console.error(error);
      return res.status(200).json({ items: [], warning: error.message });
    }
    return res.status(200).json({ items: data || [] });
  }

  if (req.method === "POST") {
    if (!adminOk(req)) return res.status(401).json({ error: "Unauthorized" });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const sku = (body.sku || "").toString().trim();
    const title = (body.title || "").toString().trim();
    if (!sku || !title) {
      return res.status(400).json({ error: "sku and title required" });
    }

    const row = {
      sku,
      title,
      description: body.description || null,
      category: body.category || null,
      blank_type: body.blank_type || null,
      colors: Array.isArray(body.colors) ? body.colors : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      print_file_url: body.print_file_url || null,
      mockup_url: body.mockup_url || null,
      base_cost_cents:
        body.base_cost_cents != null ? Number(body.base_cost_cents) : null,
      active: body.active !== false,
      notes: body.notes || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("local_catalog")
      .upsert(row, { onConflict: "sku" })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ item: data });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end("Method Not Allowed");
}
