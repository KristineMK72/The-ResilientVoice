// pages/api/printful-product/[id].js
import fs from "fs";
import path from "path";
import csv from "csv-parser";

/**
 * This endpoint returns ONE Printful "sync product" plus its variants.
 * It also injects SKU per variant using printful_variants.csv:
 *    sync_variant_id -> sku
 *
 * Required env:
 *   PRINTFUL_ACCESS_TOKEN
 *
 * Optional env:
 *   PRINTFUL_STORE_ID (not required for these endpoints, but fine to have)
 */

let skuMapCache = null;
let skuMapLoadedAt = 0;
const SKU_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function clean(v) {
  return (v ?? "").toString().trim().replace(/\r/g, "");
}

async function loadSkuMap() {
  const now = Date.now();

  // Use cached map if it exists and is fresh
  if (skuMapCache && now - skuMapLoadedAt < SKU_CACHE_TTL_MS) {
    return skuMapCache;
  }

  const map = new Map();

  // CSV lives at repo root: /printful_variants.csv
  const csvPath = path.join(process.cwd(), "printful_variants.csv");

  // If CSV isn't present (or not deployed), don't hard-crash the API
  if (!fs.existsSync(csvPath)) {
    skuMapCache = map;
    skuMapLoadedAt = now;
    return map;
  }

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        const syncVariantId = clean(row.sync_variant_id);
        const sku = clean(row.sku);
        if (syncVariantId && sku) map.set(syncVariantId, sku);
      })
      .on("end", resolve)
      .on("error", reject);
  });

  skuMapCache = map;
  skuMapLoadedAt = now;
  return map;
}

async function pfFetch(url) {
  const token = process.env.PRINTFUL_ACCESS_TOKEN;
  if (!token) throw new Error("Missing PRINTFUL_ACCESS_TOKEN");

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.result?.message ||
      data?.message ||
      `Printful API error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data;
}

export default async function handler(req, res) {
  try {
    const { id } = req.query; // sync_product_id

    if (!id) {
      return res.status(400).json({ error: "Missing product id" });
    }

    // 1) Load SKU map (sync_variant_id -> sku)
    const skuMap = await loadSkuMap();

    // 2) Fetch sync product details
    // Printful Sync Products API (v2 style) commonly:
    //   GET https://api.printful.com/store/products/{id}
    const productJson = await pfFetch(`https://api.printful.com/store/products/${encodeURIComponent(id)}`);
    const product = productJson?.result;

    if (!product) {
      return res.status(404).json({ error: "Product not found", details: productJson });
    }

    // 3) Fetch variants for that sync product
    // Common:
    //   GET https://api.printful.com/store/products/{id}
    // already includes variants in many cases, BUT some accounts return them separately:
    //   GET https://api.printful.com/store/products/{id}
    // We'll support both:
    let variants = Array.isArray(product?.variants) ? product.variants : [];

    // If variants are missing, try pulling from a variants endpoint (safe fallback)
    if (!variants.length) {
      try {
        const vJson = await pfFetch(
          `https://api.printful.com/store/products/${encodeURIComponent(id)}`
        );
        variants = Array.isArray(vJson?.result?.variants) ? vJson.result.variants : [];
      } catch {
        // ignore fallback error; we'll just return product with empty variants
      }
    }

    // 4) Normalize + inject sku
    const normalizedVariants = (variants || []).map((v) => {
      const syncVariantId = clean(v?.sync_variant_id);
      const injectedSku = syncVariantId ? skuMap.get(syncVariantId) : null;

      return {
        // IDs
        sync_variant_id: v?.sync_variant_id ?? null,
        sync_product_id: v?.sync_product_id ?? product?.id ?? product?.sync_product_id ?? null,
        variant_id: v?.variant_id ?? null, // some payloads include it
        catalog_variant_id: v?.catalog_variant_id ?? null,

        // commerce
        retail_price: v?.retail_price ?? null,
        currency: v?.currency ?? product?.currency ?? "USD",

        // display
        name: v?.name ?? null,
        color: v?.color ?? null,
        size: v?.size ?? null,
        preview_url: v?.preview_url ?? null,

        // ✅ sku (prefer API if present, fallback to CSV map)
        sku: clean(v?.sku) || injectedSku || null,
      };
    });

    // 5) Normalize product payload for your frontend
    const out = {
      // core IDs
      sync_product_id: product?.id ?? product?.sync_product_id ?? null,
      name: product?.name ?? null,
      description: product?.description ?? null,

      // imagery
      thumbnail_url: product?.thumbnail_url ?? product?.image ?? null,

      // helpful extras
      currency: product?.currency ?? "USD",
      is_ignored: product?.is_ignored ?? false,
      updated: product?.updated ?? null,

      // variants (with sku injected)
      variants: normalizedVariants,
    };

    return res.status(200).json(out);
  } catch (e) {
    console.error("❌ /api/printful-product/[id] error:", e?.message || e);
    return res.status(e.status || 500).json({
      error: e?.message || "Server error",
      details: e?.details || null,
    });
  }
}
