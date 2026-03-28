// /pages/api/internal-admin.js
export default async function handler(req, res) {
  const forwardedFor = req.headers["x-forwarded-for"] || "";
  const ip =
    forwardedFor.toString().split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const userAgent = req.headers["user-agent"] || "unknown";
  const referrer = req.headers["referer"] || null;

  // Log locally in Vercel logs
  console.warn("[HONEYPOT_HIT]", {
    ip,
    userAgent,
    method: req.method,
    referrer,
    url: req.url,
    time: new Date().toISOString(),
  });

  // Optional: forward to your security-event logger
  try {
    const host =
      req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
    const protocol =
      req.headers["x-forwarded-proto"] ||
      (host.includes("localhost") ? "http" : "https");

    await fetch(`${protocol}://${host}/api/security-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-security-log": "true",
      },
      body: JSON.stringify({
        event_type: "honeypot_hit",
        reason: "Accessed hidden internal admin endpoint",
        ip,
        path: "/api/internal-admin",
        user_agent: userAgent,
        referrer,
        details: {
          method: req.method,
        },
      }),
    });
  } catch (err) {
    console.error("[HONEYPOT_LOG_ERROR]", err);
  }

  return res.status(404).json({ error: "Not found" });
}
