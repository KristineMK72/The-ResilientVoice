// pages/api/webhooks/shop.js
// Local shop → store status updates (shipped, tracking, etc.)
// Auth: Authorization: Bearer <SHOP_WEBHOOK_SECRET> or x-shop-webhook-secret header

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function authorized(req) {
  const secret = process.env.SHOP_WEBHOOK_SECRET || process.env.SHOP_PORTAL_PASSWORD;
  if (!secret) return false;
  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const header = (req.headers["x-shop-webhook-secret"] || "").toString();
  return bearer === secret || header === secret;
}

/**
 * Map shop portal / API statuses onto orders.fulfillment_status
 */
function mapStatus(status) {
  const s = (status || "").toString().toLowerCase();
  if (["shipped", "local_shipped", "fulfilled"].includes(s)) return "local_shipped";
  if (["printing", "in_production", "local_printing"].includes(s)) return "local_printing";
  if (["hold", "local_hold", "on_hold"].includes(s)) return "local_hold";
  if (["new", "queued", "local_queue", "pending"].includes(s)) return "local_queue";
  return s || "local_queue";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const externalOrderId =
    body.externalOrderId || body.stripe_session_id || body.store_order_id || body.order_id;
  const status = mapStatus(body.status);
  const tracking = (body.tracking || body.tracking_number || "").toString().trim() || null;
  const carrier = (body.carrier || "").toString().trim() || null;

  if (!externalOrderId) {
    return res.status(400).json({ error: "externalOrderId required" });
  }

  const row = {
    stripe_session_id: String(externalOrderId),
    fulfillment_status: status,
    updated_at: new Date().toISOString(),
  };
  if (tracking) row.tracking_number = tracking;
  if (status === "local_shipped") row.fulfilled_at = new Date().toISOString();

  // Optional note with carrier
  if (carrier) {
    row.shop_notes = [carrier, tracking].filter(Boolean).join(" · ");
  }

  const { error } = await supabase.from("orders").upsert(row, {
    onConflict: "stripe_session_id",
  });

  if (error) {
    // Retry minimal columns if optional ones missing
    const minimal = {
      stripe_session_id: String(externalOrderId),
      fulfillment_status: status,
      updated_at: new Date().toISOString(),
    };
    const { error: e2 } = await supabase.from("orders").upsert(minimal, {
      onConflict: "stripe_session_id",
    });
    if (e2) {
      console.error(e2);
      return res.status(500).json({ error: e2.message });
    }
  }

  // Hook point: email customer with tracking (add later)
  console.log("[shop webhook]", externalOrderId, status, tracking || "");

  return res.status(200).json({ ok: true, externalOrderId, status, tracking });
}
