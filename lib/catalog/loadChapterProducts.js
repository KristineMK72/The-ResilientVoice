// Client-side loader for chapter pages
// 1) Try /api/catalog/:category (Supabase sync)
// 2) Fall back to fetching Printful by IDs from the response / map

/**
 * @param {string} category
 * @returns {Promise<{ products: any[], source: string, warning?: string }>}
 */
export async function loadChapterProducts(category) {
  const cat = String(category || "").toLowerCase();

  const catRes = await fetch(`/api/catalog/${cat}`);
  const catJson = await catRes.json().catch(() => ({}));

  if (!catRes.ok) {
    return {
      products: [],
      source: "error",
      warning: catJson.error || "Catalog request failed",
    };
  }

  const list = catJson.products || [];
  if (!list.length) {
    return {
      products: [],
      source: catJson.source || "empty",
      warning: catJson.warning,
    };
  }

  // Enrich with live Printful detail when variants/price missing
  const needsFetch = list.filter(
    (p) => !p.variants?.length || p.variants.every((v) => v.retail_price == null)
  );

  if (!needsFetch.length) {
    return {
      products: list.map(normalizeCard),
      source: catJson.source || "supabase",
      warning: catJson.warning,
    };
  }

  const enriched = [...list];
  for (let i = 0; i < needsFetch.length; i += 6) {
    const chunk = needsFetch.slice(i, i + 6);
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
            variants: detail.variants || p.variants || [],
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

  return {
    products: enriched.map(normalizeCard),
    source: catJson.source || "mixed",
    warning: catJson.warning,
  };
}

function normalizeCard(p) {
  const v0 = p.variants?.[0];
  return {
    ...p,
    id: String(p.sync_product_id || p.id),
    sync_product_id: String(p.sync_product_id || p.id),
    name: p.title || p.name || "Product",
    thumbnail_url: p.thumbnail_url || p.preview_url || null,
    variants: p.variants || (v0 ? [v0] : []),
  };
}
