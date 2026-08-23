// lib/catalog/byCategory.js
// Prefer Supabase printful_variants (from sync); fall back to printfulMap.

import { supabaseAdmin } from "../supabase-admin";
import { PRINTFUL_PRODUCTS } from "../printfulMap";

/**
 * Group variant rows into storefront products (one card per sync product).
 */
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

function fromPrintfulMap(category) {
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
 * @param {string} category grace | patriot | social
 * @returns {Promise<{ products: any[], source: string, warning?: string }>}
 */
export async function getProductsByCategory(category) {
  const cat = String(category || "").toLowerCase().trim();
  if (!cat) return { products: [], source: "none" };

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
      const mapped = fromPrintfulMap(cat);
      return {
        products: mapped,
        source: "printfulMap",
        warning: error.message,
      };
    }

    const grouped = groupVariants(data || []);
    if (!grouped.length) {
      const mapped = fromPrintfulMap(cat);
      return {
        products: mapped,
        source: mapped.length ? "printfulMap" : "empty",
        warning: mapped.length
          ? "No synced rows for category — using printfulMap"
          : "No products",
      };
    }

    // Prefer map order / titles when available
    const mapById = new Map(
      fromPrintfulMap(cat).map((p) => [p.id, p])
    );
    for (const p of grouped) {
      const m = mapById.get(p.id);
      if (m?.title) {
        p.name = m.title;
        p.title = m.title;
      }
      if (m?.thumbnail_url && !p.thumbnail_url) {
        p.thumbnail_url = m.thumbnail_url;
        p.preview_url = m.thumbnail_url;
      }
      p.sort = m?.sort ?? 9999;
      p.source = "supabase";
    }
    grouped.sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));

    return { products: grouped, source: "supabase" };
  } catch (e) {
    console.warn("[catalog]", e?.message || e);
    return {
      products: fromPrintfulMap(cat),
      source: "printfulMap",
      warning: e?.message || String(e),
    };
  }
}
