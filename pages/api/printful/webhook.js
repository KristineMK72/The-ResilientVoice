export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const payload = req.body;

    console.log("Printful webhook received:", payload?.type || "unknown");

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("printful webhook error:", error);
    return res.status(500).json({
      ok: false,
      error: "Webhook failed",
      details: error.message,
    });
  }
}
