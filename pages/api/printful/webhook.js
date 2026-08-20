/**
 * Printful webhook → trigger catalog sync
 *
 * In Printful Dashboard → Settings → Webhooks:
 *   URL: https://www.gritandgrace.buzz/api/printful/webhook
 *   Events: product_synced, product_updated, product_deleted (as available)
 *
 * Optional: PRINTFUL_WEBHOOK_SECRET if Printful signs payloads
 * (verify according to Printful docs for your account).
 *
 * This handler responds quickly, then runs sync.
 * On Vercel serverless, work must finish before the response ends unless
 * you use a queue — so we await sync (may take a while on large catalogs).
 * Prefer also scheduling /api/sync/full on a cron as a safety net.
 */

import { runFullSync } from "../../../lib/sync/runFullSync";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const payload = req.body || {};
    const type = payload?.type || payload?.event || "unknown";

    console.log("Printful webhook:", type);

    // Only re-sync on product-related events (adjust names to match Printful)
    const productEvents = [
      "product_synced",
      "product_updated",
      "product_deleted",
      "stock_updated",
      "package_shipped", // ignore heavy ops if you want — listed for logging
    ];

    const shouldSync =
      productEvents.some((e) => String(type).includes(e)) ||
      type === "unknown" ||
      // If Printful sends a generic ping / test
      type === "webhook_test";

    if (!shouldSync) {
      return res.status(200).json({ ok: true, skipped: true, type });
    }

    // Full sync keeps Supabase + Stripe aligned after any catalog change
    const result = await runFullSync({
      syncStripe: true,
      deactivateMissing: true,
    });

    return res.status(200).json({ ok: true, type, result });
  } catch (error) {
    console.error("printful webhook error:", error);
    // Still return 200 for non-critical failures so Printful doesn't retry forever
    // Change to 500 if you want retries
    return res.status(200).json({
      ok: false,
      error: "Webhook handled with error",
      details: error?.message || String(error),
    });
  }
}
