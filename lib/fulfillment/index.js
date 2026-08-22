// lib/fulfillment/index.js
// Pick a fulfillment provider. Default remains Printful so live checkout is unchanged.

import { PrintfulProvider } from "./providers/printful";
import { LocalShopProvider } from "./providers/localShop";

/**
 * @param {'printful'|'local'|string} [name]
 * @returns {import('./providers/base').FulfillmentProvider}
 */
export function getFulfillmentProvider(name) {
  const key = (name || process.env.FULFILLMENT_PROVIDER || "printful").toLowerCase();

  if (key === "local" || key === "localshop" || key === "shop") {
    return new LocalShopProvider();
  }

  return new PrintfulProvider();
}

export { FulfillmentProvider } from "./providers/base";
export { PrintfulProvider } from "./providers/printful";
export { LocalShopProvider } from "./providers/localShop";
