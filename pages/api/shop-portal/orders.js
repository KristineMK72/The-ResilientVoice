// pages/api/shop-portal/orders.js
// Local shop portal API — password gated via SHOP_PORTAL_PASSWORD
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const LOCAL_STATUSES = [
  "local_queue",
  "local_printing",
  "local_shipped",
  "local_hold",
  "pending", // show pending if local mode just enabled
];

function authed(req) {
  const password = process.env.SHOP_PORTAL_PASSWORD;
  if (!password) return false;
  const header = req.headers["x-shop-password"] || "";
  return header === password;
}

export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }
  if (!process.env.SHOP_PORTAL_PASSWORD) {
    return res.status(503).json({ error: "Shop portal not configured (SHOP_PORTAL_PASSWORD)" });
  }
  if (!authed(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const status = (req.query.status || "open").toString();

    let q = supabase
      .from("orders")
      .select(
        "stripe_session_id, customer_name, customer_email, ship_name, ship_line1, ship_line2, ship_city, ship_state, ship_postal, ship_country, items, fulfillment_status, amount_total, currency, tracking_number, shop_notes, fulfilled_at, updated_at, created_at"
      )
      .order("updated_at", { ascending: false })
      .limit(100);

    if (status === "open") {
      q = q.in("fulfillment_status", ["local_queue", "local_printing", "local_hold", "pending"]);
    } else if (status === "shipped") {
      q = q.eq("fulfillment_status", "local_shipped");
    } else if (status === "all_local") {
      q = q.in("fulfillment_status", LOCAL_STATUSES);
    }

    const { data, error } = await q;
    if (error) {
      // Soft fallback if optional columns missing
      const fallback = await supabase
        .from("orders")
        .select(
          "stripe_session_id, customer_name, customer_email, ship_name, ship_line1, ship_line2, ship_city, ship_state, ship_postal, ship_country, items, fulfillment_status, amount_total, currency, updated_at"
        )
        .in("fulfillment_status", ["local_queue", "local_printing", "local_hold", "pending", "local_shipped"])
        .order("updated_at", { ascending: false })
        .limit(100);

      if (fallback.error) {
        console.error(fallback.error);
        return res.status(500).json({ error: fallback.error.message });
      }
      return res.status(200).json({ orders: fallback.data || [] });
    }

    return res.status(200).json({ orders: data || [] });
  }

  if (req.method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const sessionId = body.stripe_session_id;
    const nextStatus = body.fulfillment_status;
    const tracking = (body.tracking_number || "").toString().trim() || null;
    const notes = (body.shop_notes || "").toString().trim() || null;

    if (!sessionId || !nextStatus) {
      return res.status(400).json({ error: "stripe_session_id and fulfillment_status required" });
    }
    if (!LOCAL_STATUSES.includes(nextStatus) && nextStatus !== "local_shipped") {
      return res.status(400).json({ error: "Invalid status" });
    }

    const row = {
      stripe_session_id: sessionId,
      fulfillment_status: nextStatus,
      updated_at: new Date().toISOString(),
    };
    if (tracking !== null) row.tracking_number = tracking;
    if (notes !== null) row.shop_notes = notes;
    if (nextStatus === "local_shipped") row.fulfilled_at = new Date().toISOString();

    const { error } = await supabase.from("orders").upsert(row, { onConflict: "stripe_session_id" });

    if (error) {
      // Retry without optional columns
      const minimal = {
        stripe_session_id: sessionId,
        fulfillment_status: nextStatus,
        updated_at: new Date().toISOString(),
      };
      const { error: e2 } = await supabase.from("orders").upsert(minimal, { onConflict: "stripe_session_id" });
      if (e2) {
        console.error(e2);
        return res.status(500).json({ error: e2.message });
      }
    }

    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).end("Method Not Allowed");
}
