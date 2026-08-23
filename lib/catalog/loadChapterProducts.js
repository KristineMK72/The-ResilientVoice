// Client-side loader for chapter pages
// Catalog API first; if empty/fail, use printfulMap IDs + Printful detail.

import { PRINTFUL_PRODUCTS } from "../printfulMap";

function mapFallback(category) {
  const cat = String(category || "").toLowerCase();
  return Object.values(PRINTFUL_PRODUCTS)
    .filter((p) => p?.category === cat && p?.sync_product_id)
    .map((p) => ({
      id: String(p.sync_product_id),
      sync_product_id: String(p.sync_product_id),
      name: p.title || "Product",
      title: p.title || "Product",
      category: p.category,
      thumbnail_url: p.thumbnail_url || null,
      preview_url: p.thumbnail_url || null,
      variants: [],
      sort: typeof p.sort === "number" ? p.sort : 9999,
      source: "printfulMap",
    }))
    .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999));
}

function normalizeCard(p) {
  const v0 = p.variants?.[0];
  return {
    ...p,
    id: String(p.sync_product_id || p.id),
    sync_product_id: String(p.sync_product_id || p.id),
    name: p.title || p.name || "Product",
    title: p.title || p.name || "Product",
    thumbnail_url: p.thumbnail_url || p.preview_url || null,
    variants: p.variants || (v0 ? [v0] : []),
  };
}

async function enrichWithPrintful(list) {
  const enriched = [...list];
  const needs = list.filter(
    (p) =>
      !p.variants?.length ||
      p.variants.every((v) => v.retail_price == null && v.price == null)
  );

  for (let i = 0; i < needs.length; i += 6) {
    const chunk = needs.slice(i, i + 6);
    const results = await Promise.all(
      chunk.map(async (p) => {
        try {
          const res = await fetch(`/api/printful-product/${p.id}`);
          if (!res.ok) return p;
          const detail = await res.json();
          return {
            ...p,
            name: p.title || p.name || detail.name,
            title: p.title || p.name || detail.name,
            thumbnail_url:
              p.thumbnail_url || detail.thumbnail_url || detail.preview_url,
            preview_url:
              p.preview_url || detail.preview_url || detail.thumbnail_url,
            variants: detail.variants?.length ? detail.variants : p.variants || [],
            sync_product_id: p.id,
          };
        } catch {
          return p;
        }
      })
    );
    for (const r of results) {
      const idx = enriched.findIndex((x) => String(x.id) === String(r.id));
      if (idx >= 0) enriched[idx] = r;
    }
  }
  return enriched;
}

/**
 * @param {string} category
 */
export async function loadChapterProducts(category) {
  const cat = String(category || "").toLowerCase();
  let list = [];
  let source = "printfulMap";
  let warning;

  try {
    const catRes = await fetch(`/api/catalog/${cat}`);
    const catJson = await catRes.json().catch(() => ({}));

    if (catRes.ok && Array.isArray(catJson.products) && catJson.products.length) {
      list = catJson.products;
      source = catJson.source || "catalog";
      warning = catJson.warning;
    } else {
      warning = catJson.error || catJson.warning || "Catalog empty — using map";
      list = mapFallback(cat);
      source = "printfulMap";
    }
  } catch (e) {
    warning = e?.message || "Catalog request failed";
    list = mapFallback(cat);
    source = "printfulMap";
  }

  if (!list.length) {
    list = mapFallback(cat);
    source = "printfulMap";
  }

  if (!list.length) {
    return { products: [], source, warning: warning || "No products" };
  }

  // Show map thumbs/titles immediately; enrich prices in place when possible
  const withDetail = await enrichWithPrintful(list);
  return {
    products: withDetail.map(normalizeCard),
    source,
    warning,
  };
}
