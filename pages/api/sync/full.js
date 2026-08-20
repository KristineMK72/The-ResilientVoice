/**
 * Secured full sync endpoint.
 *
 * POST /api/sync/full
 * Header: Authorization: Bearer <SYNC_SECRET>
 *   or query ?secret=<SYNC_SECRET>
 *
 * Body (optional JSON):
 *   { "syncStripe": true, "deactivateMissing": true }
 *
 * Schedule with Vercel Cron, GitHub Actions, or a simple external cron:
 *   curl -X POST https://www.gritandgrace.buzz/api/sync/full \
 *     -H "Authorization: Bearer $SYNC_SECRET"
 */

import { runFullSync } from "../../../lib/sync/runFullSync";

function authorized(req) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;

  const header = req.headers.authorization || "";
  if (header === `Bearer ${secret}`) return true;
  if (req.query?.secret === secret) return true;
  if (req.headers["x-sync-secret"] === secret) return true;

  // Vercel Cron sends this header when CRON_SECRET is set
  if (
    process.env.CRON_SECRET &&
    req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
  ) {
    return true;
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!authorized(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  // Prevent overlapping runs on serverless (best-effort)
  try {
    const body =
      typeof req.body === "object" && req.body ? req.body : {};

    const result = await runFullSync({
      syncStripe: body.syncStripe !== false,
      deactivateMissing: body.deactivateMissing !== false,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("full sync error:", error);
    return res.status(500).json({
      ok: false,
      error: "Sync failed",
      details: error?.message || String(error),
    });
  }
}

// Allow longer runtime on Vercel Pro; ignored on Hobby but harmless
export const config = {
  maxDuration: 300,
};
