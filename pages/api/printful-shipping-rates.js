// pages/api/printful-shipping-rates.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      recipient, // { address1, address2, city, state_code, country_code, zip }
      items,     // [{ sync_variant_id OR variant_id, quantity }]
      currency,  // optional, like "USD"
      locale,    // optional, like "en_US"
    } = req.body || {};

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

    // NOTE:
    // Printful’s shipping-rate API expects items in a JSON list and a store header.  [oai_citation:1‡Pipedream](https://pipedream.com/apps/easyly/integrations/printful/calculate-shipping-rates-with-printful-api-on-new-event-triggered-instant-from-easyly-api-int_pQsOQ962)
    // Their example uses variant_id.  [oai_citation:2‡Pipedream](https://pipedream.com/apps/easyly/integrations/printful/calculate-shipping-rates-with-printful-api-on-new-event-triggered-instant-from-easyly-api-int_pQsOQ962)
    // If your cart uses sync_variant_id, you can send sync_variant_id instead of variant_id
    // (works when you’re working with store-synced products). If it errors, switch to variant_id.
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
        currency,
        locale,
      }),
    });

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      return res.status(printfulRes.status).json({
        error: "Printful shipping rates failed",
        details: data,
      });
    }

    // data.result is typically an array of rates (name, rate, currency, etc.)
    return res.status(200).json(data);
  } catch (e) {
    console.error("Shipping rates error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
