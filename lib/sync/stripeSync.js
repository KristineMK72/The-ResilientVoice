/**
 * Ensure every Printful variant has a Stripe Product + Price.
 * Writes stripe_price_id back to Supabase.
 */

import Stripe from "stripe";
import { setStripePriceId } from "./supabaseSync";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key, {
    apiVersion: process.env.STRIPE_API_VERSION || "2024-11-20.acacia",
  });
}

async function findOrCreateProduct(stripe, syncProductId, productName) {
  try {
    const found = await stripe.products.search({
      query: `metadata['sync_product_id']:'${syncProductId}'`,
      limit: 1,
    });
    if (found.data?.length) return found.data[0];
  } catch {
    // search may fail on some accounts — fall through to create
  }

  return stripe.products.create({
    name: productName || `Printful Product ${syncProductId}`,
    metadata: {
      sync_product_id: String(syncProductId),
      printful_sync_product_id: String(syncProductId),
    },
  });
}

async function findPriceBySku(stripe, sku) {
  if (!sku) return null;

  try {
    const byLookup = await stripe.prices.list({
      lookup_keys: [`${sku}-v2`, sku],
      limit: 2,
    });
    if (byLookup.data?.length) return byLookup.data[0];
  } catch {
    // ignore
  }

  try {
    const found = await stripe.prices.search({
      query: `metadata['sku']:'${sku}'`,
      limit: 1,
    });
    if (found.data?.length) return found.data[0];
  } catch {
    // ignore
  }

  return null;
}

function buildMetadata(variant) {
  const sku = variant.sku || "";
  return {
    sku,
    sync_product_id: String(variant.printful_sync_product_id),
    sync_variant_id: String(variant.printful_sync_variant_id),
    color: variant.color || "",
    size: variant.size || "",
    printful_sku: sku,
    printful_sync_product_id: String(variant.printful_sync_product_id),
    printful_sync_variant_id: String(variant.printful_sync_variant_id),
    printful_color: variant.color || "",
    printful_size: variant.size || "",
  };
}

/**
 * @param {Array} catalogProducts - from fetchFullPrintfulCatalog()
 */
export async function syncStripeFromCatalog(catalogProducts) {
  const stripe = getStripe();
  const productCache = new Map();

  let created = 0;
  let updated = 0;
  let replaced = 0;
  let skipped = 0;

  for (const product of catalogProducts) {
    let productObj = productCache.get(product.syncProductId);
    if (!productObj) {
      productObj = await findOrCreateProduct(
        stripe,
        product.syncProductId,
        product.title
      );
      productCache.set(product.syncProductId, productObj);
    }

    for (const variant of product.variants) {
      const sku = (variant.sku || "").trim();
      const priceNum = Number(variant.retail_price);
      if (!sku || !Number.isFinite(priceNum) || priceNum <= 0) {
        skipped += 1;
        continue;
      }

      const unit_amount = Math.round(priceNum * 100);
      const currency = (variant.currency || "usd").toLowerCase();
      const metadata = buildMetadata(variant);

      const existing = await findPriceBySku(stripe, sku);

      if (existing) {
        try {
          await stripe.prices.update(existing.id, { metadata });
          updated += 1;
        } catch (e) {
          console.error(`Stripe metadata update failed ${sku}:`, e.message);
        }

        const amountChanged = existing.unit_amount !== unit_amount;
        const currencyChanged =
          (existing.currency || "").toLowerCase() !== currency;

        if (amountChanged || currencyChanged) {
          try {
            const price = await stripe.prices.create(
              {
                product: productObj.id,
                unit_amount,
                currency,
                nickname: `${variant.color || ""} / ${variant.size || ""}`.trim(),
                lookup_key: `${sku}-v2`,
                transfer_lookup_key: true,
                metadata,
              },
              {
                idempotencyKey: `pf-sync-${variant.printful_sync_variant_id}-${unit_amount}-${currency}`,
              }
            );
            await stripe.prices.update(existing.id, { active: false });
            await setStripePriceId(variant.printful_sync_variant_id, price.id);
            replaced += 1;
          } catch (e) {
            console.error(`Stripe price replace failed ${sku}:`, e.message);
          }
        } else {
          await setStripePriceId(variant.printful_sync_variant_id, existing.id);
        }
        continue;
      }

      try {
        const price = await stripe.prices.create(
          {
            product: productObj.id,
            unit_amount,
            currency,
            nickname: `${variant.color || ""} / ${variant.size || ""}`.trim(),
            lookup_key: `${sku}-v2`,
            metadata,
          },
          {
            idempotencyKey: `pf-sync-${variant.printful_sync_variant_id}-${unit_amount}-${currency}`,
          }
        );
        await setStripePriceId(variant.printful_sync_variant_id, price.id);
        created += 1;
      } catch (e) {
        console.error(`Stripe price create failed ${sku}:`, e.message);
        skipped += 1;
      }
    }
  }

  return { created, updated, replaced, skipped };
}
