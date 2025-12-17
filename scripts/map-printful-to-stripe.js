import fs from "fs";
import csv from "csv-parser";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const rows = [];

fs.createReadStream("printful_variants.csv")
  .pipe(csv())
  .on("data", (data) => rows.push(data))
  .on("end", async () => {
    console.log(`Found ${rows.length} Printful variants`);

    for (const row of rows) {
      const {
        sku,
        sync_variant_id,
        sync_product_id,
        color,
        size,
      } = row;

      try {
        // Find Stripe price by lookup_key == SKU
        const prices = await stripe.prices.list({
          lookup_keys: [sku],
          limit: 1,
        });

        if (!prices.data.length) {
          console.warn(`⚠️ No Stripe price for SKU ${sku}`);
          continue;
        }

        const price = prices.data[0];

        await stripe.prices.update(price.id, {
          metadata: {
            printful_sync_variant_id: sync_variant_id,
            printful_sync_product_id: sync_product_id,
            printful_color: color,
            printful_size: size,
            printful_sku: sku,
          },
        });

        console.log(`✅ Linked ${sku} → ${price.id}`);
      } catch (err) {
        console.error(`❌ Error for SKU ${sku}`, err.message);
      }
    }

    console.log("🎉 Stripe ↔ Printful mapping complete");
  });
