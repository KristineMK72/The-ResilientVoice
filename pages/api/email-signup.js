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
    const { email } = req.body || {};
    const clean = String(email || "").trim().toLowerCase();

    if (!clean || !clean.includes("@") || clean.length > 254) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const ip =
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
      null;

    const userAgent = req.headers["user-agent"] || null;

    const { error } = await supabase
      .from("email_signups")
      .upsert(
        [{ email: clean, source: "homepage", ip, user_agent: userAgent }],
        { onConflict: "email" }
      );

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Email signup error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
