// pages/api/printful-shipping-rates.js

function clean(v) {
  return (v ?? "").toString().trim().replace(/\r/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = process.env.PRINTFUL_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Missing PRINTFUL_ACCESS_TOKEN" });
    }

    const { recipient, items, currency = "USD", locale } = req.body || {};

    // ---- Validate recipient ----
    const r = recipient || {};
    const normalizedRecipient = {
      name: clean(r.name), // optional
      address1: clean(r.address1),
      address2: clean(r.address2),
      city: clean(r.city),
      state_code: clean(r.state_code), // optional for some countries; required for US typically
      country_code: clean(r.country_code),
      zip: clean(r.zip),
    };

    if (
      !normalizedRecipient.address1 ||
      !normalizedRecipient.city ||
      !normalizedRecipient.country_code ||
      !normalizedRecipient.zip
    ) {
      return res.status(400).json({
        error: "Missing recipient fields",
        required: ["address1", "city", "country_code", "zip"],
      });
    }

    // ---- Validate + normalize items ----
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing items" });
    }

    const normalizedItems = items
      .map((it) => {
        const quantity = Number(it?.quantity || 0);
        if (!Number.isFinite(quantity) || quantity <= 0) return null;

        // Accept both naming styles:
        // { sync_variant_id } or { variant_id }
        const sync_variant_id =
          it?.sync_variant_id ?? it?.syncVariantId ?? it?.sync_variant ?? null;
        const variant_id = it?.variant_id ?? it?.variantId ?? it?.variant ?? null;

        if (sync_variant_id != null) {
          const n = Number(clean(sync_variant_id));
          if (!Number.isFinite(n)) return null;
          return { sync_variant_id: n, quantity };
        }

        if (variant_id != null) {
          const n = Number(clean(variant_id));
          if (!Number.isFinite(n)) return null;
          return { variant_id: n, quantity };
        }

        return null;
      })
      .filter(Boolean);

    if (normalizedItems.length === 0) {
      return res.status(400).json({
        error:
          "No valid items. Each item must include (sync_variant_id OR variant_id) and quantity > 0",
      });
    }

    // ---- Call Printful ----
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Optional: store header (nice to have, not required for most tokens)
    if (process.env.PRINTFUL_STORE_ID) {
      headers["X-PF-Store-Id"] = process.env.PRINTFUL_STORE_ID;
    }

    const printfulRes = await fetch("https://api.printful.com/shipping/rates", {
      method: "POST",
      headers,
      body: JSON.stringify({
        recipient: normalizedRecipient,
        items: normalizedItems,
        currency,
        ...(locale ? { locale } : {}),
      }),
    });

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      console.error("❌ Printful shipping rates failed:", {
        status: printfulRes.status,
        data,
      });
      return res.status(printfulRes.status).json({
        error: "Printful shipping rates failed",
        details: data,
      });
    }

    // data.result is usually the list of rates
    return res.status(200).json(data);
  } catch (e) {
    console.error("Shipping rates error:", e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
