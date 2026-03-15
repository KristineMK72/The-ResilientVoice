import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PRINTFUL_ACCESS_TOKEN = process.env.PRINTFUL_ACCESS_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PRINTFUL_ACCESS_TOKEN) {
  throw new Error(
    "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or PRINTFUL_ACCESS_TOKEN"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function printfulFetch(path, init = {}) {
  const res = await fetch(`https://api.printful.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PRINTFUL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Printful error ${res.status} for ${path}: ${text}`);
  }

  return res.json();
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractPossibleModelStrings(name) {
  const text = cleanText(name);
  const guesses = [];

  const brandModelPatterns = [
    /\b(Gildan\s+\d{4,6})\b/i,
    /\b(Bella\+Canvas\s+\d{4,6})\b/i,
    /\b(Bella\s*\+\s*Canvas\s+\d{4,6})\b/i,
    /\b(Comfort Colors\s+\d{4,6})\b/i,
    /\b(Next Level\s+\d{3,6})\b/i,
    /\b(Champion\s+\d{3,6})\b/i,
    /\b(Hanes\s+\d{3,6})\b/i,
    /\b(Adidas\s+\d{3,6})\b/i,
    /\b(American Apparel\s+\d{3,6})\b/i,
    /\b(Lane Seven\s+\d{3,6})\b/i,
  ];

  for (const pattern of brandModelPatterns) {
    const match = text.match(pattern);
    if (match) guesses.push(match[1]);
  }

  const slashSplit = text.split("/").map((s) => s.trim()).filter(Boolean);
  if (slashSplit.length) guesses.push(slashSplit[0]);

  return [...new Set(guesses)];
}

function scoreCatalogProduct(catalogProduct, guesses) {
  const title = cleanText(catalogProduct?.title || catalogProduct?.name || "");
  const brand = cleanText(catalogProduct?.brand || "");
  const combined = `${brand} ${title}`.toLowerCase();

  let score = 0;

  for (const guess of guesses) {
    const g = guess.toLowerCase();
    if (combined.includes(g)) score += 100;

    const parts = g.split(/\s+/);
    for (const part of parts) {
      if (part && combined.includes(part)) score += 10;
    }
  }

  return score;
}

async function findBestCatalogProduct(guesses) {
  if (!guesses.length) return null;

  const searchTerm = encodeURIComponent(guesses[0]);
  const result = await printfulFetch(`/v2/catalog-products?search=${searchTerm}`);

  const candidates = Array.isArray(result?.data) ? result.data : [];
  if (!candidates.length) return null;

  const ranked = candidates
    .map((item) => ({ item, score: scoreCatalogProduct(item, guesses) }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item || null;
}

async function getCatalogVariants(catalogProductId) {
  const result = await printfulFetch(
    `/v2/catalog-products/${catalogProductId}/catalog-variants`
  );
  return Array.isArray(result?.data) ? result.data : [];
}

async function getCatalogSizeGuide(catalogProductId) {
  try {
    const result = await printfulFetch(`/v2/catalog-products/${catalogProductId}/sizes`);
    return result?.data || null;
  } catch (error) {
    console.warn(`No size guide for catalog product ${catalogProductId}: ${error.message}`);
    return null;
  }
}

function normalizeVariantMap(catalogVariants) {
  return catalogVariants.map((v) => ({
    id: String(v.id),
    name: cleanText(v.name || v.title || ""),
    size: cleanText(v.size || ""),
    color: cleanText(v.color || ""),
    sku: cleanText(v.sku || ""),
    product: v,
  }));
}

function findBestCatalogVariant(localVariant, normalizedCatalogVariants) {
  const localName = cleanText(localVariant?.name || "").toLowerCase();
  const localSize = cleanText(localVariant?.size || "").toLowerCase();
  const localColor = cleanText(localVariant?.color || "").toLowerCase();
  const localSku = cleanText(localVariant?.sku || "").toLowerCase();

  let best = null;
  let bestScore = -1;

  for (const candidate of normalizedCatalogVariants) {
    let score = 0;

    if (localSku && candidate.sku && localSku === candidate.sku.toLowerCase()) score += 100;
    if (localSize && candidate.size && localSize === candidate.size.toLowerCase()) score += 30;
    if (localColor && candidate.color && localColor === candidate.color.toLowerCase()) score += 30;
    if (localName && candidate.name && localName.includes(candidate.name.toLowerCase())) score += 20;

    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}

async function enrichProduct(product) {
  const guesses = extractPossibleModelStrings(
    [
      product.title,
      ...(product.product_variants || []).map((v) => v.name),
    ].join(" ")
  );

  if (!guesses.length) {
    console.log(`Skipping ${product.title}: no model guess found`);
    return;
  }

  const catalogProduct = await findBestCatalogProduct(guesses);

  if (!catalogProduct) {
    console.log(`No catalog match for ${product.title} using guesses: ${guesses.join(", ")}`);
    return;
  }

  const catalogProductId = String(catalogProduct.id);
  const catalogVariants = await getCatalogVariants(catalogProductId);
  const normalizedCatalogVariants = normalizeVariantMap(catalogVariants);
  const sizeGuide = await getCatalogSizeGuide(catalogProductId);

  const productUpdate = {
    printful_catalog_product_id: catalogProductId,
    brand: catalogProduct.brand || null,
    product_details_json: catalogProduct,
    size_guide_json: sizeGuide,
  };

  const { error: productUpdateError } = await supabase
    .from("products")
    .update(productUpdate)
    .eq("id", product.id);

  if (productUpdateError) {
    throw productUpdateError;
  }

  for (const localVariant of product.product_variants || []) {
    const bestCatalogVariant = findBestCatalogVariant(localVariant, normalizedCatalogVariants);

    const variantUpdate = {
      brand: catalogProduct.brand || null,
      material:
        bestCatalogVariant?.product?.material ||
        catalogProduct?.material ||
        null,
      product_details_json: bestCatalogVariant?.product || null,
      printful_catalog_variant_id: bestCatalogVariant?.id || null,
    };

    const { error: variantUpdateError } = await supabase
      .from("product_variants")
      .update(variantUpdate)
      .eq("id", localVariant.id);

    if (variantUpdateError) {
      throw variantUpdateError;
    }
  }

  console.log(
    `Enriched ${product.title} -> catalog ${catalogProductId} (${catalogProduct.brand || "unknown brand"})`
  );
}

async function main() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      title,
      product_variants (
        id,
        name,
        size,
        color,
        sku
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  for (const product of data || []) {
    try {
      await enrichProduct(product);
    } catch (err) {
      console.error(`Failed enriching ${product.title}:`, err.message);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
