/**
 * One entry point: Printful → Supabase → Stripe
 */

import { fetchFullPrintfulCatalog } from "./printfulCatalog";
import {
  upsertPrintfulVariants,
  deactivateMissingVariants,
} from "./supabaseSync";
import { syncStripeFromCatalog } from "./stripeSync";

/**
 * @param {object} options
 * @param {boolean} [options.syncStripe=true]
 * @param {boolean} [options.deactivateMissing=true]
 */
export async function runFullSync(options = {}) {
  const { syncStripe = true, deactivateMissing = true } = options;
  const startedAt = new Date().toISOString();

  const catalog = await fetchFullPrintfulCatalog();

  const supabaseResult = await upsertPrintfulVariants(catalog);

  let deactivated = { deactivated: 0 };
  if (deactivateMissing) {
    const activeIds = catalog.flatMap((p) =>
      p.variants.map((v) => v.printful_sync_variant_id)
    );
    deactivated = await deactivateMissingVariants(activeIds);
  }

  let stripeResult = null;
  if (syncStripe) {
    stripeResult = await syncStripeFromCatalog(catalog);
  }

  return {
    ok: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    products: catalog.length,
    variants: catalog.reduce((n, p) => n + p.variants.length, 0),
    supabase: supabaseResult,
    deactivated,
    stripe: stripeResult,
  };
}
