// /pages/api/track-view.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { path, referrer, visitor_type } = req.body || {};

    const forwarded = (req.headers["x-forwarded-for"] || "").toString();
    const ip = forwarded.split(",")[0]?.trim() || null;

    const userAgent = req.headers["user-agent"] || null;

    // Vercel geo headers (automatic if deployed there)
    const country = req.headers["x-vercel-ip-country"] || null;
    const region = req.headers["x-vercel-ip-country-region"] || null;
    const city = req.headers["x-vercel-ip-city"] || null;

    const { error } = await supabase.from("page_views").insert({
      path: path || null,
      referrer: referrer || null,
      visitor_type: visitor_type === "buyer" ? "buyer" : "visitor",
      ip,
      user_agent: userAgent,
      country,
      region,
      city,
    });

    if (error) {
      console.error("DB insert error:", error);
      return res.status(500).json({ error: "DB error" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Track error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
