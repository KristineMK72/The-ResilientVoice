import fs from "fs";
import csv from "csv-parser";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const rows = [];

const norm = (s) => (s ?? "").toString().trim().replace(/\r/g, "");
const nick = (color, size) => `${norm(color)} / ${norm(size)}`;

(async function main() {
  await new Promise((resolve, reject) => {
    fs.createReadStream("printful_variants.csv")
      .pipe(csv())
      .on("data", (r) => rows.push(r))
      .on("end", resolve)
      .on("error", reject);
  });

  // sync_product_id -> nickname -> sku
  const byProd = new Map();
  for (const r of rows) {
    const sync_product_id = norm(r.sync_product_id);
    const color = norm(r.color);
    const size = norm(r.size);
    const sku = norm(r.sku);
    if (!sync_product_id || !color || !size || !sku) continue;

    if (!byProd.has(sync_product_id)) byProd.set(sync_product_id, new Map());
    byProd.get(sync_product_id).set(nick(color, size), sku);
  }

  let starting_after = undefined;
  let updated = 0;

  while (true) {
    const prodPage = await stripe.products.list({ limit: 100, starting_after });
    if (!prodPage.data.length) break;

    for (const prod of prodPage.data) {
      const syncId = norm(prod.metadata?.sync_product_id);
      if (!syncId || !byProd.has(syncId)) continue;

      const nickToSku = byProd.get(syncId);
      const prices = await stripe.prices.list({ product: prod.id, limit: 100 });

      for (const price of prices.data) {
        const n = norm(price.nickname);
        const sku = nickToSku.get(n);

        if (!sku) {
          console.warn(`⚠️ No CSV match for sync_product_id=${syncId} price "${n}" (${price.id})`);
          continue;
        }

        if (price.lookup_key === sku) continue;

        await stripe.prices.update(price.id, {
          lookup_key: sku,
          transfer_lookup_key: true,
          metadata: {
            ...(price.metadata || {}),
            printful_sku: sku,
            printful_sync_product_id: syncId,
          },
        });

        console.log(`✅ Set lookup_key ${sku} on ${price.id} (${n})`);
        updated++;
      }
    }

    starting_after = prodPage.data[prodPage.data.length - 1].id;
  }

  console.log(`🎉 Done. Updated ${updated} prices.`);
})();
