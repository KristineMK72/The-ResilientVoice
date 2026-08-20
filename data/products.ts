// data/products.ts
// Typed product helpers — compatible with Printful response formats

import type { PrintfulApiProduct, StoreProduct } from "@/types/product";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeProduct(item: PrintfulApiProduct): StoreProduct {
  const id = String(item.id ?? item.sync_product?.id ?? "");
  const name = (item.name || item.sync_product?.name || "Unnamed Product").trim();
  const price = parseFloat(
    String(item.retail_price ?? item.variants?.[0]?.retail_price ?? 0)
  );
  const image =
    item.thumbnail_url ||
    item.sync_product?.thumbnail_url ||
    "https://files.cdn.printful.com/o/upload/missing-image/400x400";

  return {
    id,
    name,
    price: Number.isFinite(price) ? price : 0,
    image,
    slug: toSlug(name || "product"),
    description: name,
    variants: item.sync_variants || item.variants || [],
    tags: String(item.tags || "").toLowerCase(),
    thumbnail_url: item.thumbnail_url ?? item.sync_product?.thumbnail_url ?? null,
    sync_product_id: id,
  };
}

/** Main function used across the storefront */
export async function getAllProducts(): Promise<StoreProduct[]> {
  try {
    const res = await fetch(
      "https://the-resilient-voice.vercel.app/api/printful-products",
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("Failed to fetch products:", res.status);
      return [];
    }

    const data: unknown = await res.json();
    const record = data as Record<string, unknown>;
    const rawProducts =
      (record.result as PrintfulApiProduct[] | undefined) ||
      (record.products as PrintfulApiProduct[] | undefined) ||
      (Array.isArray(data) ? (data as PrintfulApiProduct[]) : []);

    if (!Array.isArray(rawProducts)) {
      console.warn("Unexpected product data format:", data);
      return [];
    }

    return rawProducts.map(normalizeProduct);
  } catch (error) {
    console.error("getAllProducts error:", error);
    return [];
  }
}

export async function getProductById(
  id: string
): Promise<StoreProduct | null> {
  const products = await getAllProducts();
  return products.find((p) => p.id === String(id)) || null;
}

export async function getProductBySlug(
  slug: string
): Promise<StoreProduct | null> {
  const products = await getAllProducts();
  return products.find((p) => p.slug === slug) || null;
}
