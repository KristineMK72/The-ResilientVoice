import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const path = String(body.path || "").trim() || null;
    const referrer = String(body.referrer || "").trim() || null;
    const visitorType =
      String(body.visitor_type || "visitor").trim().toLowerCase() || "visitor";

    const forwardedFor = (req.headers["x-forwarded-for"] || "").toString();
    const ip = forwardedFor.split(",")[0].trim() || null;
    const userAgent = req.headers["user-agent"] || null;

    const geoCountry =
      req.headers["x-vercel-ip-country"] ||
      req.headers["x-country"] ||
      null;

    const geoRegion =
      req.headers["x-vercel-ip-country-region"] ||
      req.headers["x-region"] ||
      null;

    const geoCity =
      req.headers["x-vercel-ip-city"] ||
      req.headers["x-city"] ||
      null;

    const { error } = await supabase.from("page_views").insert({
      path,
      referrer,
      user_agent: userAgent,
      ip,
      visitor_type: visitorType === "buyer" ? "buyer" : "visitor",
      country: geoCountry,
      region: geoRegion,
      city: geoCity,
    });

    if (error) {
      console.error("track-view insert error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("track-view error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
