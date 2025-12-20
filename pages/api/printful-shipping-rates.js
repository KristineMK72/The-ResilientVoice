// pages/api/printful-shipping-rates.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { recipient, items } = req.body || {};

    if (!process.env.PRINTFUL_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Missing PRINTFUL_ACCESS_TOKEN" });
    }
    if (!process.env.PRINTFUL_STORE_ID) {
      return res.status(500).json({ error: "Missing PRINTFUL_STORE_ID" });
    }

    if (!recipient?.address1 || !recipient?.city || !recipient?.country_code || !recipient?.zip) {
      return res.status(400).json({ error: "Missing recipient fields" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing items" });
    }

    // Printful expects items with sync_variant_id for store synced products
    const printfulRes = await fetch("https://api.printful.com/shipping/rates", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID,
      },
      body: JSON.stringify({
        recipient,
        items,
        currency: "USD",
        locale: "en_US",
      }),
    });

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      return res.status(printfulRes.status).json({
        error: "Printful shipping rates failed",
        details: data,
      });
    }

    const rates = Array.isArray(data?.result) ? data.result : [];
    const cleanRates = rates
      .map((r) => ({
        id: (r.id || r.name || "").toString(),
        name: (r.name || "Shipping").toString(),
        rate: Number(r.rate),
        currency: (r.currency || "USD").toString(),
        minDeliveryDays: r.minDeliveryDays ?? r.min_delivery_days ?? null,
        maxDeliveryDays: r.maxDeliveryDays ?? r.max_delivery_days ?? null,
      }))
      .filter((r) => Number.isFinite(r.rate));

    return res.status(200).json({ rates: cleanRates });
  } catch (e) {
    console.error("Shipping rates error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
