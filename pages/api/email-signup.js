export default function handler(req, res) {
  // Allow POST from browser forms
  if (req.method === "POST") {
    try {
      const { email } = req.body || {};
      const clean = String(email || "").trim().toLowerCase();

      if (!clean || !clean.includes("@")) {
        return res.status(400).json({ error: "Invalid email" });
      }

      console.log("📩 New email signup:", clean);

      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Email signup error:", e);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // Helpful response for accidental GET (e.g. user visits URL in browser)
  res.setHeader("Allow", "POST");
  return res.status(200).json({
    ok: true,
    message: "Email signup endpoint. Send a POST with JSON: { email }",
  });
}
