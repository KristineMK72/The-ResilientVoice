// pages/api/calculate-shipping.js

function toNum(v) {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = process.env.PRINTFUL_ACCESS_TOKEN || process.env.PRINTFUL_API_KEY;
    if (!token) return res.status(500).json({ error: "Missing PRINTFUL_ACCESS_TOKEN" });

    const { cart, address } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!address?.address1 || !address?.city || !address?.country_code || !address?.zip) {
      return res.status(400).json({ error: "Missing address fields" });
    }

    const recipient = {
      name: address.name || "Customer",
      address1: address.address1,
      address2: address.address2 || undefined,
      city: address.city,
      state_code: address.state_code || undefined,
      country_code: address.country_code || "US",
      zip: address.zip,
    };

    // Build both item lists so we can fallback cleanly:
    const itemsSync = cart
      .map((i) => ({
        sync_variant_id: toNum(i.sync_variant_id),
        quantity: toNum(i.quantity || 1),
      }))
      .filter((x) => Number.isFinite(x.sync_variant_id) && x.sync_variant_id > 0 && x.quantity > 0);

    const itemsCatalog = cart
      .map((i) => ({
        variant_id: toNum(i.catalog_variant_id), // IMPORTANT: uses catalog_variant_id from your cart
        quantity: toNum(i.quantity || 1),
      }))
      .filter((x) => Number.isFinite(x.variant_id) && x.variant_id > 0 && x.quantity > 0);

    if (!itemsSync.length && !itemsCatalog.length) {
      return res.status(400).json({
        error: "No valid items to rate (missing sync_variant_id and catalog_variant_id)",
      });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // If you have PRINTFUL_STORE_ID set, include it (safe + helpful for multi-store)
    if (process.env.PRINTFUL_STORE_ID) {
      headers["X-PF-Store-Id"] = process.env.PRINTFUL_STORE_ID;
    }

    async function callPrintful(itemsBody) {
      const pfRes = await fetch("https://api.printful.com/shipping/rates", {
        method: "POST",
        headers,
        body: JSON.stringify({
          recipient,
          items: itemsBody,
          currency: "USD",
        }),
      });

      const pfJson = await pfRes.json().catch(() => ({}));
      return { ok: pfRes.ok, status: pfRes.status, json: pfJson };
    }

    // 1) Try sync_variant_id first (store-synced)
    let attempt = null;
    if (itemsSync.length) {
      attempt = await callPrintful(itemsSync);
      if (attempt.ok) {
        const rates = (attempt.json?.result || []).map((r) => ({
          id: r.id || r.name,
          name: r.name,
          rate: Number(r.rate),
          currency: r.currency || "USD",
          minDays: r.minDeliveryDays ?? null,
          maxDays: r.maxDeliveryDays ?? null,
        }));
        return res.status(200).json({ rates, used: "sync_variant_id" });
      }
    }

    // 2) Fallback to catalog variant_id (most reliable for shipping/rates)
    if (itemsCatalog.length) {
      const attempt2 = await callPrintful(itemsCatalog);
      if (attempt2.ok) {
        const rates = (attempt2.json?.result || []).map((r) => ({
          id: r.id || r.name,
          name: r.name,
          rate: Number(r.rate),
          currency: r.currency || "USD",
          minDays: r.minDeliveryDays ?? null,
          maxDays: r.maxDeliveryDays ?? null,
        }));
        return res.status(200).json({ rates, used: "variant_id" });
      }

      // Both failed — return the most useful debug details
      return res.status(502).json({
        error: "Printful shipping rates failed",
        details: {
          sync_attempt: attempt ? { status: attempt.status, json: attempt.json } : null,
          variant_attempt: { status: attempt2.status, json: attempt2.json },
        },
      });
    }

    // If we got here, only sync list existed and it failed
    return res.status(502).json({
      error: "Printful shipping rates failed",
      details: attempt ? { status: attempt.status, json: attempt.json } : null,
    });
  } catch (e) {
    console.error("calculate-shipping error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
