/**
 * Grit & Grace / The Resilient Voice — product types
 * Single source of truth for catalog shapes across Printful, Supabase, and the storefront.
 */

export type ProductCategory = "grace" | "patriot" | "social";

/** Entry in lib/printfulMap (manual catalog map) */
export interface PrintfulProductMapEntry {
  sync_product_id: string;
  title: string;
  hash: string;
  category: ProductCategory;
  thumbnail_url: string;
}

/** Shape of new-social-products.json */
export interface NewSocialProductItem {
  id: number;
  external_id: string;
  name: string;
  thumbnail_url: string;
  variants: number;
  synced: number;
}

export interface NewSocialProductsJson {
  collection: string;
  products: NewSocialProductItem[];
}

/** A single size/color variant as used in the store */
export interface ProductVariant {
  sync_variant_id?: string | number | null;
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  retail_price?: number | string | null;
  preview_url?: string | null;
  stripe_price_id?: string | null;
  [key: string]: unknown;
}

/**
 * Normalized product used by the storefront
 * (homepage featured carousel, ProductGrid, product pages)
 */
export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  description: string;
  variants: ProductVariant[];
  tags: string;
  category?: ProductCategory | string | null;
  thumbnail_url?: string | null;
  sync_product_id?: string | null;
  collection?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  colors?: string[];
  sizes?: string[];
}

/** Row shape from Supabase printful_variants (as used by ProductGrid) */
export interface PrintfulVariantRow {
  printful_sync_product_id: string | number;
  printful_sync_variant_id?: string | number | null;
  name?: string | null;
  product_title?: string | null;
  category?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  color?: string | null;
  size?: string | null;
  sku?: string | null;
  retail_price?: number | string | null;
  currency?: string | null;
  is_active?: boolean | null;
  stripe_price_id?: string | null;
}

/** Loose Printful API product payload (before normalization) */
export interface PrintfulApiProduct {
  id?: string | number;
  sync_product?: {
    id?: string | number;
    name?: string;
    thumbnail_url?: string;
  };
  name?: string;
  retail_price?: string | number;
  thumbnail_url?: string;
  tags?: string;
  variants?: ProductVariant[];
  sync_variants?: ProductVariant[];
  [key: string]: unknown;
}
