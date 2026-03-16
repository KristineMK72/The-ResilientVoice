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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeSizeGuide(catalog, variant, allVariants = []) {
  const rawGuide = catalog?.size_guide || null;
  const productInfo = catalog?.product || null;

  const allSizes = unique(allVariants.map((v) => v?.size));

  if (rawGuide && typeof rawGuide === "object") {
    return {
      ...rawGuide,
      available_sizes:
        rawGuide.available_sizes && Array.isArray(rawGuide.available_sizes)
          ? rawGuide.available_sizes
          : allSizes.length
          ? allSizes
          : [variant?.size].filter(Boolean),
      note:
        rawGuide.note ||
        "If you are between sizes and want a roomier fit, consider sizing up.",
      has_measurements: hasMeasurementData(rawGuide),
    };
  }

  return {
    available_sizes: allSizes.length ? allSizes : [variant?.size].filter(Boolean),
    note:
      "If you are between sizes and want a roomier fit, consider sizing up.",
    has_measurements: false,
    source: "fallback",
    model: productInfo?.model || null,
    product_title: productInfo?.title || null,
  };
}

function hasMeasurementData(guide) {
  if (!guide || typeof guide !== "object") return false;

  const disallowed = new Set(["note", "available_sizes", "has_measurements", "source"]);
  const keys = Object.keys(guide).filter((k) => !disallowed.has(k));

  if (!keys.length) return false;

  for (const key of keys) {
    const value = guide[key];
    if (Array.isArray(value) && value.length) return true;
    if (value && typeof value === "object" && Object.keys(value).length) return true;
    if (typeof value === "string" && value.trim()) return true;
  }

  return false;
}

function extractMaterial(productInfo) {
  if (!productInfo) return null;

  if (productInfo.material) return productInfo.material;
  if (productInfo.composition) return productInfo.composition;

  const description = productInfo.description || "";
  const bulletLines = String(description)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.startsWith("•"));

  const likelyMaterialLines = bulletLines.filter((line) =>
    /cotton|polyester|spandex|blend|fleece|jersey/i.test(line)
  );

  if (likelyMaterialLines.length) {
    return likelyMaterialLines.join(" ");
  }

  return description || null;
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
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const listData = await printfulFetch("/store/products");

    for (const listItem of listData?.result || []) {
      const syncProductId = listItem?.sync_product?.id || listItem?.id || null;
      if (!syncProductId) continue;

      const detailData = await printfulFetch(`/store/products/${syncProductId}`);
      const item = detailData?.result || listItem;

      const title =
        item?.sync_product?.name ||
        item?.name ||
        `Product ${syncProductId}`;

      const slug = slugify(title);

      const thumbnailUrl =
        item?.sync_product?.thumbnail_url ||
        item?.thumbnail_url ||
        null;

      const variants = item?.sync_variants || [];

      console.log(`Product ${syncProductId} has ${variants.length} variants`);

      // Pull catalog info from the first variant that has a catalog variant id
      let firstCatalog = null;
      const firstCatalogVariantId =
        variants.find((v) => v?.variant_id)?.variant_id || null;

      if (firstCatalogVariantId) {
        firstCatalog = await getCatalogVariantInfo(firstCatalogVariantId);
      }

      const firstProductInfo = firstCatalog?.product || null;
      const productLevelSizeGuide = normalizeSizeGuide(
        firstCatalog,
        variants[0] || null,
        variants
      );

      const productBrand =
        firstProductInfo?.brand ||
        firstProductInfo?.model ||
        "Grit & Grace";

      const { data: productRow, error: productError } = await supabaseAdmin
        .from("products")
        .upsert(
          {
            printful_sync_product_id: String(syncProductId),
            printful_catalog_product_id: firstProductInfo?.id
              ? String(firstProductInfo.id)
              : null,
            title,
            slug,
            thumbnail_url: thumbnailUrl,
            brand: productBrand,
            size_guide_json: productLevelSizeGuide,
            product_details_json: firstProductInfo,
            active: true,
          },
          { onConflict: "printful_sync_product_id" }
        )
        .select("id")
        .single();

      if (productError) throw productError;

      for (const variant of variants) {
        const catalogVariantId = variant?.variant_id || null;
        const catalog = catalogVariantId
          ? await getCatalogVariantInfo(catalogVariantId)
          : null;

        const productInfo = catalog?.product || firstProductInfo || null;

        const material = extractMaterial(productInfo);

        const brand =
          productInfo?.brand ||
          productInfo?.model ||
          productBrand ||
          null;

        const sizeGuide = normalizeSizeGuide(catalog, variant, variants);

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
