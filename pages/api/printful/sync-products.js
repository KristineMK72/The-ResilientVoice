import { supabaseAdmin } from "../../../lib/supabase-admin";
import { printfulFetch } from "../../../lib/printful";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getCatalogVariantInfo(catalogVariantId) {
  try {
    if (!catalogVariantId) return null;

    const data = await printfulFetch(`/products/variant/${catalogVariantId}`);
    return data?.result || null;
  } catch (error) {
    console.error(
      "catalog variant fetch failed:",
      catalogVariantId,
      error?.message || error
    );
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const data = await printfulFetch("/store/products");

    console.log(
      "First Printful product sample:",
      JSON.stringify(data?.result?.[0] || null, null, 2)
    );

    for (const item of data?.result || []) {
      const syncProductId = item?.sync_product?.id || item?.id || null;

      if (!syncProductId) {
        console.warn("Skipping product with missing sync product ID:", item);
        continue;
      }

      const title =
        item?.sync_product?.name ||
        item?.name ||
        `Product ${syncProductId}`;

      const slug = slugify(title);

      const thumbnailUrl =
        item?.sync_product?.thumbnail_url ||
        item?.thumbnail_url ||
        null;

      const { data: productRow, error: productError } = await supabaseAdmin
        .from("products")
        .upsert(
          {
            printful_sync_product_id: String(syncProductId),
            title,
            slug,
            thumbnail_url: thumbnailUrl,
            active: true,
          },
          { onConflict: "printful_sync_product_id" }
        )
        .select("id")
        .single();

      if (productError) throw productError;

      for (const variant of item?.sync_variants || []) {
        const catalogVariantId = variant?.variant_id || null;
        const catalog = catalogVariantId
          ? await getCatalogVariantInfo(catalogVariantId)
          : null;

        const productInfo = catalog?.product || null;

        const material =
          productInfo?.material ||
          productInfo?.description ||
          null;

        const brand =
          productInfo?.brand ||
          productInfo?.model ||
          null;

        const sizeGuide =
          catalog?.size_guide ||
          {
            available_sizes: [variant?.size].filter(Boolean),
            note:
              "If you are between sizes and want a roomier fit, consider sizing up.",
          };

        const variantImage =
          variant?.files?.[0]?.preview_url ||
          variant?.preview_url ||
          null;

        const inferredFitNotes = /heavyweight/i.test(variant?.name || "")
          ? "Heavier feel; great for cooler weather."
          : "Standard fit; if you are between sizes, consider sizing up for a roomier fit.";

        const { error: variantError } = await supabaseAdmin
          .from("product_variants")
          .upsert(
            {
              product_id: productRow.id,
              printful_sync_variant_id: String(variant?.id),
              printful_catalog_variant_id: catalogVariantId
                ? String(catalogVariantId)
                : null,
              sku: variant?.sku || null,
              name: variant?.name || "Unnamed Variant",
              color: variant?.color || null,
              size: variant?.size || null,
              retail_price: variant?.retail_price
                ? Number(variant.retail_price)
                : null,
              currency: variant?.currency || "USD",
              brand,
              material,
              fit_notes: inferredFitNotes,
              size_guide_json: sizeGuide,
              product_details_json: productInfo,
              image_url: variantImage,
              in_stock: true,
            },
            { onConflict: "printful_sync_variant_id" }
          );

        if (variantError) throw variantError;
      }
    }

    return res.status(200).json({
      ok: true,
      message: "Printful catalog synced successfully",
    });
  } catch (error) {
    console.error("sync-products error:", error);

    return res.status(500).json({
      ok: false,
      error: "Product sync failed",
      details: error?.message || "Unknown error",
    });
  }
}
