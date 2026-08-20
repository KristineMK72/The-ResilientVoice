/**
 * Unified product image resolution
 *
 * WHY MOCKUPS LOOK INCONSISTENT TODAY
 * -----------------------------------
 * 1. Product page prefers local files: /public/{sync_product_id}_1.png, _2.png…
 * 2. Collection pages (Grace / Social / Patriot) only use Printful API thumbnail_url
 * 3. printfulMap hardcodes thumbnail_url — some are real CDN links, some are
 *    "REPLACE_WITH_REAL_THUMB_URL"
 * 4. ProductGrid reads Supabase thumbnail_url / image_url
 * 5. Printful only returns a good mockup when the sync product has preview files attached
 *
 * RESULT: pieces with local mockups in /public look great on the product page
 * but collections may show a different (or weaker) Printful auto-mockup.
 * Newer map entries with placeholder URLs show broken/missing images.
 *
 * FIX: always resolve images through this helper everywhere.
 */

export type ImageSourceOptions = {
  /** Printful sync_product_id (string or number) */
  syncProductId?: string | number | null;
  /** From API: product.thumbnail_url */
  thumbnailUrl?: string | null;
  /** From API: variants[0].preview_url */
  previewUrl?: string | null;
  /** From printfulMap entry */
  mapThumbnailUrl?: string | null;
  /** Fallback asset in /public */
  fallback?: string;
  /** How many local angles to try: /{id}_1.png … /{id}_N.png */
  localMax?: number;
};

const PLACEHOLDER_MARKERS = [
  "REPLACE_WITH_REAL_THUMB",
  "missing-image",
  "placeholder",
];

function isUsableUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  if (!u) return false;
  if (PLACEHOLDER_MARKERS.some((m) => u.includes(m))) return false;
  return true;
}

/** Local mockup paths you already store under /public */
export function localMockupPaths(
  syncProductId: string | number | null | undefined,
  max = 8
): string[] {
  if (syncProductId == null || syncProductId === "") return [];
  const id = String(syncProductId);
  return Array.from({ length: max }, (_, i) => `/${id}_${i + 1}.png`);
}

/**
 * Ordered candidate list for a product image.
 * Prefer local mockups (your Printful downloads), then API preview, then map, then fallback.
 */
export function productImageCandidates(opts: ImageSourceOptions): string[] {
  const {
    syncProductId,
    thumbnailUrl,
    previewUrl,
    mapThumbnailUrl,
    fallback = "/fallback.png",
    localMax = 3,
  } = opts;

  const local = localMockupPaths(syncProductId, localMax);
  const remote = [previewUrl, thumbnailUrl, mapThumbnailUrl].filter(isUsableUrl);
  const unique = [...new Set([...local, ...remote, fallback])];
  return unique;
}

/**
 * Best single image for grids / cards (sync-friendly).
 * Note: local files are listed first; the UI should still probe onerror → next candidate
 * OR use the product page’s probe pattern. For SSR/API, prefer Printful URLs if local
 * existence can’t be checked.
 */
export function pickBestProductImage(opts: ImageSourceOptions): string {
  const candidates = productImageCandidates(opts);
  // Prefer first remote usable URL for server-side; client can prefer local via probe
  const remote = candidates.find(
    (c) => c.startsWith("http://") || c.startsWith("https://")
  );
  const local = candidates.find((c) => c.startsWith("/") && !c.includes("fallback"));
  // Client collections: try local first in <Image onError>
  return local || remote || opts.fallback || "/fallback.png";
}

/**
 * React-friendly: primary src + ordered fallbacks for onError chaining
 */
export function productImageWithFallbacks(opts: ImageSourceOptions): {
  primary: string;
  fallbacks: string[];
} {
  const all = productImageCandidates(opts);
  return {
    primary: all[0] || "/fallback.png",
    fallbacks: all.slice(1),
  };
}
