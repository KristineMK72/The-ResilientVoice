// /pages/api/security-event.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function clean(value) {
  return value == null ? null : String(value).trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const event = {
      event_type: clean(body.event_type) || "unknown",
      reason: clean(body.reason),
      ip: clean(body.ip),
      path: clean(body.path),
      user_agent: clean(body.user_agent),
      referrer: clean(body.referrer),
      details: body.details ?? {},
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("security_events")
      .insert([event])
      .select()
      .single();

    if (error) {
      console.error("[SECURITY_EVENT_INSERT_ERROR]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, event: data });
  } catch (err) {
    console.error("[SECURITY_EVENT_API_ERROR]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
