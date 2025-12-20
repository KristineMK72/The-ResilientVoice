// pages/api/calculate-shipping.js

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token =
      process.env.PRINTFUL_ACCESS_TOKEN || process.env.PRINTFUL_API_KEY;

    if (!token) return res.status(500).json({ error: "Missing PRINTFUL_ACCESS_TOKEN" });

    const { cart, address } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!address?.address1 || !address?.city || !address?.country_code || !address?.zip) {
      return res.status(400).json({ error: "Missing address fields" });
    }

    // Printful wants recipient + items
    const recipient = {
      name: address.name || "Customer",
      address1: address.address1,
      address2: address.address2 || undefined,
      city: address.city,
      state_code: address.state_code || undefined,
      country_code: address.country_code || "US",
      zip: address.zip,
    };

    const items = cart
      .map((i) => ({
        // IMPORTANT: for store-synced products, Printful uses sync_variant_id
        sync_variant_id: Number(i.sync_variant_id),
        quantity: Number(i.quantity || 1),
      }))
      .filter((x) => Number.isFinite(x.sync_variant_id) && x.sync_variant_id > 0 && x.quantity > 0);

    if (!items.length) {
      return res.status(400).json({ error: "No valid items to rate (missing sync_variant_id?)" });
    }

    const pfRes = await fetch("https://api.printful.com/shipping/rates", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient,
        items,
        currency: "USD",
      }),
    });

    const pfJson = await pfRes.json();

    if (!pfRes.ok) {
      return res.status(pfRes.status).json({
        error: "Printful shipping rates failed",
        details: pfJson,
      });
    }

    // Normalize result to a simple list your UI can use
    const rates = (pfJson?.result || []).map((r) => ({
      id: r.id || r.name,           // Printful sometimes includes id; if not, fallback
      name: r.name,
      rate: Number(r.rate),         // numeric
      currency: r.currency || "USD",
      minDays: r.minDeliveryDays ?? null,
      maxDays: r.maxDeliveryDays ?? null,
    }));

    return res.status(200).json({ rates });
  } catch (e) {
    console.error("calculate-shipping error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
