// lib/catalog/byCategory.js
// Prefer Supabase printful_variants (from sync); always keep printfulMap as safety net.

import { supabaseAdmin } from "../supabase-admin";
import { PRINTFUL_PRODUCTS } from "../printfulMap";

function groupVariants(rows) {
  const byProduct = new Map();

  for (const r of rows || []) {
    const pid = String(r.printful_sync_product_id || "");
    if (!pid) continue;
    if (!byProduct.has(pid)) {
      byProduct.set(pid, {
        id: pid,
        sync_product_id: pid,
        name: r.product_title || r.name || "Product",
        title: r.product_title || r.name || "Product",
        category: r.category || null,
        thumbnail_url: r.thumbnail_url || r.image_url || null,
        preview_url: r.image_url || r.thumbnail_url || null,
        variants: [],
        source: "supabase",
      });
    }
    const p = byProduct.get(pid);
    if (!p.thumbnail_url && (r.thumbnail_url || r.image_url)) {
      p.thumbnail_url = r.thumbnail_url || r.image_url;
      p.preview_url = r.image_url || r.thumbnail_url;
    }
    p.variants.push({
      id: r.printful_sync_variant_id,
      retail_price: r.retail_price,
      price: r.retail_price,
      currency: r.currency,
      size: r.size,
      color: r.color,
      sku: r.sku,
      stripe_price_id: r.stripe_price_id || null,
    });
  }

  return Array.from(byProduct.values());
}

export function fromPrintfulMap(category) {
  const cat = String(category || "").toLowerCase();
  const list = Object.values(PRINTFUL_PRODUCTS)
    .filter((p) => p?.category === cat && p?.sync_product_id)
    .map((p) => ({
      id: String(p.sync_product_id),
      sync_product_id: String(p.sync_product_id),
      name: p.title || "Product",
      title: p.title || "Product",
      category: p.category,
      thumbnail_url: p.thumbnail_url || null,
      preview_url: p.thumbnail_url || null,
      sort: typeof p.sort === "number" ? p.sort : 9999,
      variants: [],
      source: "printfulMap",
    }));

  list.sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));
  return list;
}

/**
 * Merge map + supabase so chapters never go empty when sync is partial.
 */
function mergeProducts(mapList, dbList) {
  const byId = new Map();

  for (const p of mapList || []) {
    byId.set(String(p.id), { ...p });
  }

  for (const p of dbList || []) {
    const id = String(p.id);
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, { ...p, sort: p.sort ?? 9999 });
      continue;
    }
    byId.set(id, {
      ...existing,
      ...p,
      title: existing.title || p.title,
      name: existing.title || existing.name || p.name,
      thumbnail_url: p.thumbnail_url || existing.thumbnail_url,
      preview_url: p.preview_url || existing.preview_url,
      variants:
        p.variants?.length > 0 ? p.variants : existing.variants || [],
      sort: existing.sort ?? p.sort ?? 9999,
      source: "merged",
    });
  }

  return Array.from(byId.values()).sort(
    (a, b) => (a.sort ?? 9999) - (b.sort ?? 9999)
  );
}

/**
 * @param {string} category grace | patriot | social
 */
export async function getProductsByCategory(category) {
  const cat = String(category || "").toLowerCase().trim();
  if (!cat) return { products: [], source: "none" };

  const mapList = fromPrintfulMap(cat);

  try {
    const { data, error } = await supabaseAdmin
      .from("printful_variants")
      .select(
        "printful_sync_product_id, printful_sync_variant_id, name, product_title, category, sku, color, size, retail_price, currency, thumbnail_url, image_url, stripe_price_id, is_active"
      )
      .eq("category", cat)
      .eq("is_active", true);

    if (error) {
      console.warn("[catalog] supabase:", error.message);
      return {
        products: mapList,
        source: "printfulMap",
        warning: error.message,
      };
    }

    const grouped = groupVariants(data || []);
    const merged = mergeProducts(mapList, grouped);

    return {
      products: merged,
      source: grouped.length ? "merged" : "printfulMap",
      warning: !merged.length ? "No products for category" : undefined,
    };
  } catch (e) {
    console.warn("[catalog]", e?.message || e);
    return {
      products: mapList,
      source: "printfulMap",
      warning: e?.message || String(e),
    };
  }
}
