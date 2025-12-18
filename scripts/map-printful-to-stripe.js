import fs from "fs";
import csv from "csv-parser";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

const clean = (v) => (v ?? "").toString().trim().replace(/\r/g, "").replace(/"/g, "");

const rows = [];

fs.createReadStream("printful_variants.csv")
  .pipe(csv())
  .on("data", (data) => rows.push(data))
  .on("end", async () => {
    console.log(`Found ${rows.length} Printful variants`);

    for (const row of rows) {
      const sku = clean(row.sku);
      const sync_variant_id = clean(row.sync_variant_id);
      const sync_product_id = clean(row.sync_product_id);
      const color = clean(row.color);
      const size = clean(row.size);

      if (!sku || !sync_variant_id || !sync_product_id) {
        console.warn(`⚠️ Skipping row missing required fields: sku=${sku}`);
        continue;
      }

      try {
        let price = null;

        // 1) Try find by lookup_key == SKU (fast path)
        const byLookup = await stripe.prices.list({
          lookup_keys: [sku],
          limit: 1,
        });
        if (byLookup.data.length) price = byLookup.data[0];

        // 2) Fallback: find by metadata.sku (helps when lookup_key is null)
        if (!price) {
          try {
            const q = `metadata['sku']:'${sku}'`;
            const found = await stripe.prices.search({ query: q, limit: 1 });
            if (found.data?.length) price = found.data[0];
          } catch (e) {
            // ignore if search not available
          }
        }

        if (!price) {
          console.warn(`⚠️ No Stripe price found for SKU ${sku}`);
          continue;
        }

        // Merge metadata (don't wipe anything else already stored)
        const nextMeta = {
          ...(price.metadata || {}),
          printful_sync_variant_id: sync_variant_id,
          printful_sync_product_id: sync_product_id,
          printful_color: color,
          printful_size: size,
          printful_sku: sku,
          // also keep generic keys
          sku,
          sync_variant_id,
          sync_product_id,
          color,
          size,
        };

        // If lookup_key is missing, try to set it (Stripe may allow this if it’s currently null)
        const updatePayload = { metadata: nextMeta };
        if (!price.lookup_key) updatePayload.lookup_key = sku;

        await stripe.prices.update(price.id, updatePayload);

        console.log(`✅ Linked ${sku} → ${price.id} (lookup_key=${price.lookup_key || sku})`);
      } catch (err) {
        console.error(`❌ Error for SKU ${sku}:`, err?.message || err);
      }
    }

    console.log("🎉 Stripe ↔ Printful mapping complete");
  });
