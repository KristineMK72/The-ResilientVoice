// pages/api/report-scam.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function clean(v) {
  return v == null ? null : String(v).trim();
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const body = req.body || {};

      const row = {
        phone_number: clean(body.phone_number),
        scammer_name: clean(body.scammer_name),
        platform: clean(body.platform),
        item_referenced: clean(body.item_referenced),
        message_text: clean(body.message_text),
        notes: clean(body.notes),
        ip: clean(body.ip),
        city: clean(body.city),
        region: clean(body.region),
        country: clean(body.country),
        reported_to_carrier: Boolean(body.reported_to_carrier),
        reported_to_platform: Boolean(body.reported_to_platform),
        reported_to_ftc: Boolean(body.reported_to_ftc),
      };

      const { data, error } = await supabase
        .from("scam_reports")
        .insert([row])
        .select()
        .single();

      if (error) {
        console.error("[REPORT_SCAM_INSERT_ERROR]", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, report: data });
    } catch (err) {
      console.error("[REPORT_SCAM_API_ERROR]", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("scam_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("[REPORT_SCAM_FETCH_ERROR]", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, reports: data || [] });
    } catch (err) {
      console.error("[REPORT_SCAM_GET_ERROR]", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
