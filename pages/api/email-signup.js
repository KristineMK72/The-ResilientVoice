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

    try {
      const host = requireEnv("SMTP_HOST");
      const port = Number(requireEnv("SMTP_PORT"));
      const user = requireEnv("SMTP_USER");
      const pass = requireEnv("SMTP_PASS");

      const adminTo = process.env.EMAIL_TO || user;
      const from = process.env.EMAIL_FROM || `Grit & Grace <${user}>`;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      // 1) Notify admin
      await transporter.sendMail({
        from,
        to: adminTo,
        subject: "New Grit & Grace Email Signup",
        text: `New signup: ${clean}\nSource: homepage\nIP: ${ip || "unknown"}\nUA: ${
          userAgent || "unknown"
        }\nTime: ${new Date().toISOString()}`,
      });

      // 2) Send confirmation to subscriber
      await transporter.sendMail({
        from,
        to: clean,
        subject: "Welcome to Grit & Grace",
        text: `Thank you for joining the Grit & Grace email list.

You’ll be first to hear about new product drops, special releases, and community updates.

We’re grateful you’re here.

— Grit & Grace`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="margin-bottom: 12px;">Welcome to Grit &amp; Grace</h2>
            <p>Thank you for joining the Grit &amp; Grace email list.</p>
            <p>You’ll be first to hear about new product drops, special releases, and community updates.</p>
            <p>We’re grateful you’re here.</p>
            <p style="margin-top: 20px;"><strong>— Grit &amp; Grace</strong></p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Signup email send failed:", mailErr);
      // Still return success because the signup was saved
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Email signup error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
