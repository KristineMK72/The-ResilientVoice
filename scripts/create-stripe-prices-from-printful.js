import fs from "fs";
import csv from "csv-parser";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  process.exit(1);
}
const stripe = new Stripe(key);

const rows = [];
fs.createReadStream("printful_variants.csv")
  .pipe(csv())
  .on("data", (r) => rows.push(r))
  .on("end", async () => {
    console.log(`Found ${rows.length} variants in CSV`);

    // Create ONE Stripe Product per Printful sync_product_id
    const productCache = new Map();

    for (const r of rows) {
      const sync_product_id = r.sync_product_id?.replace(/"/g, "").trim();
      const product_name    = r.product_name?.replace(/"/g, "").trim();
      const sync_variant_id = r.sync_variant_id?.replace(/"/g, "").trim();
      const color           = r.color?.replace(/"/g, "").trim();
      const size            = r.size?.replace(/"/g, "").trim();
      const sku             = r.sku?.replace(/"/g, "").trim();
      const retail_price    = Number(String(r.retail_price).replace(/"/g, "").trim());
      const currency        = (r.currency?.replace(/"/g, "").trim() || "USD").toLowerCase();

      if (!sync_product_id || !sync_variant_id || !sku || !retail_price) {
        console.log(`⚠️ Skipping row missing fields: sku=${sku} price=${retail_price}`);
        continue;
      }

      let stripeProductId = productCache.get(sync_product_id);
      if (!stripeProductId) {
        const p = await stripe.products.create({
          name: product_name || `Printful Product ${sync_product_id}`,
          metadata: { sync_product_id }
        });
        stripeProductId = p.id;
        productCache.set(sync_product_id, stripeProductId);
        console.log(`✅ Created product ${p.id} for sync_product_id=${sync_product_id}`);
      }

      // idempotency key so re-runs don't duplicate prices
      const idem = `pf-${sync_variant_id}-${retail_price}-${currency}`;

      const unit_amount = Math.round(retail_price * 100);

      try {
        const price = await stripe.prices.create(
          {
            product: stripeProductId,
            unit_amount,
            currency,
            nickname: `${color} / ${size}`,
            metadata: {
              sku,
              sync_product_id,
              sync_variant_id,
              color,
              size
            }
          },
          { idempotencyKey: idem }
        );
        console.log(`✅ Price ${price.id} for SKU ${sku} (${unit_amount} ${currency})`);
      } catch (e) {
        console.error(`❌ Failed price for SKU ${sku}:`, e?.message || e);
      }
    }

    console.log("🎉 Done creating Stripe products + prices.");
  });
