/**
 * Upsert Printful catalog into Supabase `printful_variants`
 * (table used by ProductGrid) and optionally `products`.
 */

import { supabaseAdmin } from "../supabase-admin";
import { inferCategory } from "./category";

/**
 * Upsert every variant row for the storefront grid.
 * Requires table `printful_variants` with unique on printful_sync_variant_id
 * (or adjust onConflict to match your schema).
 */
export async function upsertPrintfulVariants(catalogProducts) {
  let upserted = 0;
  let errors = 0;

  for (const product of catalogProducts) {
    const category = inferCategory(product);

    for (const variant of product.variants) {
      if (!variant.printful_sync_variant_id) continue;

      const row = {
        printful_sync_product_id: variant.printful_sync_product_id,
        printful_sync_variant_id: variant.printful_sync_variant_id,
        name: variant.name,
        product_title: variant.product_title || product.title,
        category,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        retail_price: variant.retail_price,
        currency: variant.currency || "USD",
        thumbnail_url: variant.thumbnail_url || product.thumbnailUrl,
        image_url: variant.image_url || product.thumbnailUrl,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from("printful_variants")
        .upsert(row, { onConflict: "printful_sync_variant_id" });

      if (error) {
        console.error(
          `printful_variants upsert failed ${variant.printful_sync_variant_id}:`,
          error.message
        );
        errors += 1;
      } else {
        upserted += 1;
      }
    }
  }

  return { upserted, errors };
}

/**
 * Write Stripe price id back onto the variant row.
 */
export async function setStripePriceId(syncVariantId, stripePriceId) {
  if (!syncVariantId || !stripePriceId) return;

  const { error } = await supabaseAdmin
    .from("printful_variants")
    .update({
      stripe_price_id: stripePriceId,
      updated_at: new Date().toISOString(),
    })
    .eq("printful_sync_variant_id", String(syncVariantId));

  if (error) {
    console.error(
      `Failed to set stripe_price_id for ${syncVariantId}:`,
      error.message
    );
  }
}

/**
 * Mark variants missing from the latest Printful pull as inactive
 * (optional soft-delete so the site stops showing removed products).
 */
export async function deactivateMissingVariants(activeSyncVariantIds) {
  const ids = activeSyncVariantIds.map(String);
  if (!ids.length) return { deactivated: 0 };

  const { data, error } = await supabaseAdmin
    .from("printful_variants")
    .select("printful_sync_variant_id")
    .eq("is_active", true);

  if (error || !data) return { deactivated: 0 };

  const activeSet = new Set(ids);
  const toDeactivate = data
    .map((r) => String(r.printful_sync_variant_id))
    .filter((id) => id && !activeSet.has(id));

  if (!toDeactivate.length) return { deactivated: 0 };

  const { error: updErr } = await supabaseAdmin
    .from("printful_variants")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .in("printful_sync_variant_id", toDeactivate);

  if (updErr) {
    console.error("deactivateMissingVariants:", updErr.message);
    return { deactivated: 0 };
  }

  return { deactivated: toDeactivate.length };
}
