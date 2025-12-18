import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`Missing env var: ${name}`);
  return process.env[name];
}

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

    // ---- Email notification (does NOT block the signup if it fails) ----
    try {
      const host = requireEnv("SMTP_HOST"); // smtp.gmail.com
      const port = Number(requireEnv("SMTP_PORT")); // 465
      const user = requireEnv("SMTP_USER"); // info@gritandgrace.buzz
      const pass = requireEnv("SMTP_PASS"); // app password (no spaces)

      const to = process.env.EMAIL_TO || user;
      const from = process.env.EMAIL_FROM || `Grit & Grace <${user}>`;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to,
        subject: "New Grit & Grace Email Signup",
        text: `New signup: ${clean}\nSource: homepage\nIP: ${ip || "unknown"}\nUA: ${
          userAgent || "unknown"
        }\nTime: ${new Date().toISOString()}`,
      });
    } catch (mailErr) {
      console.error("Signup email notify failed:", mailErr);
      // We still return success because signup is saved in Supabase.
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Email signup error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
