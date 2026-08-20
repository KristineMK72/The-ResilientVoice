/**
 * EXAMPLE — how to type lib/printfulMap.ts
 * Copy this pattern into your real printfulMap file (rename .js → .ts).
 * Do not use this file as-is; your full catalog lives in printfulMap.js today.
 */

import type { PrintfulProductMapEntry } from "@/types/product";

export const PRINTFUL_PRODUCTS: Record<string, PrintfulProductMapEntry> = {
  joy: {
    sync_product_id: "402037152",
    title: "Joy",
    hash: "6912c960a9e152",
    category: "grace",
    thumbnail_url:
      "https://files.cdn.printful.com/files/2f3/2f324865f5e884af9aaab57aeba51347_preview.png",
  },
  freedom_long_sleeve: {
    sync_product_id: "405190886",
    title: "FREEDOM Long Sleeve Tee",
    hash: "692ce389778bb3",
    category: "patriot",
    thumbnail_url:
      "https://files.cdn.printful.com/files/e72/e72f30bcd5f2683f69479e433951d9a7_preview.png",
  },
  messy_long_sleeve: {
    sync_product_id: "408880904",
    title: "Messy Long Sleeve",
    hash: "6948bf7dc865c5",
    category: "social",
    thumbnail_url:
      "https://files.cdn.printful.com/files/8be/8be93e95dd941c565fdb514c72956a37_preview.png",
  },
  // ... paste the rest of your map; category must be "grace" | "patriot" | "social"
};

export function getMapEntry(
  key: string
): PrintfulProductMapEntry | undefined {
  return PRINTFUL_PRODUCTS[key];
}

export function getMapBySyncId(
  syncProductId: string
): PrintfulProductMapEntry | undefined {
  return Object.values(PRINTFUL_PRODUCTS).find(
    (p) => p.sync_product_id === String(syncProductId)
  );
}
