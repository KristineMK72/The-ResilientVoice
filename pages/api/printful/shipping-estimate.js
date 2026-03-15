import { printfulFetch } from "@/lib/printful";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body;

    if (!body?.recipient?.country_code) {
      return res.status(400).json({
        ok: false,
        error: "country_code is required",
      });
    }

    if (!body?.items?.length) {
      return res.status(400).json({
        ok: false,
        error: "At least one item is required",
      });
    }

    const result = await printfulFetch("/shipping/rates", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return res.status(200).json({ ok: true, result });
  } catch (error) {
    console.error("shipping-estimate error:", error);
    return res.status(500).json({
      ok: false,
      error: "Unable to fetch shipping estimate",
      details: error.message,
    });
  }
}
