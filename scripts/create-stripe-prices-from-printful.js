import fs from "fs";
import csv from "csv-parser";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  process.exit(1);
}
const stripe = new Stripe(key, { apiVersion: "2025-06-30.basil" });

const clean = (v) => (v ?? "").toString().replace(/"/g, "").trim().replace(/\r/g, "");
const num = (v) => Number(clean(v));

async function findOrCreateProduct(sync_product_id, product_name) {
  // Try to find existing Stripe product by metadata
  // (If your Stripe account doesn't have search enabled, this will throw and we fall back to create.)
  try {
    const q = `metadata['sync_product_id']:'${sync_product_id}'`;
    const found = await stripe.products.search({ query: q, limit: 1 });
    if (found.data?.length) return found.data[0];
  } catch (e) {
    // ignore and create
  }

  return await stripe.products.create({
    name: product_name || `Printful Product ${sync_product_id}`,
    metadata: { sync_product_id },
  });
}

async function findPriceBySku(skuClean) {
  // Prefer lookup_key if it exists
  try {
    const byLookup = await stripe.prices.list({ lookup_keys: [skuClean], limit: 1 });
    if (byLookup.data?.length) return byLookup.data[0];
  } catch (e) {
    // ignore
  }

  // Fallback: search by metadata.sku
  try {
    const q = `metadata['sku']:'${skuClean}'`;
    const found = await stripe.prices.search({ query: q, limit: 1 });
    if (found.data?.length) return found.data[0];
  } catch (e) {
    // ignore
  }

  return null;
}

const rows = [];
fs.createReadStream("printful_variants.csv")
  .pipe(csv())
  .on("data", (r) => rows.push(r))
  .on("end", async () => {
    console.log(`Found ${rows.length} variants in CSV`);

    const productCache = new Map();

    for (const r of rows) {
      const sync_product_id = clean(r.sync_product_id);
      const product_name    = clean(r.product_name);
      const sync_variant_id = clean(r.sync_variant_id);
      const color           = clean(r.color);
      const size            = clean(r.size);
      const sku             = clean(r.sku);
      const retail_price    = num(r.retail_price);
      const currency        = (clean(r.currency) || "USD").toLowerCase();

      if (!sync_product_id || !sync_variant_id || !sku || !retail_price) {
        console.log(`⚠️ Skipping row missing fields: sku=${sku} price=${retail_price}`);
        continue;
      }

      const skuClean = sku; // already cleaned
      const unit_amount = Math.round(retail_price * 100);

      // 1) Ensure product exists (one per sync_product_id)
      let productObj = productCache.get(sync_product_id);
      if (!productObj) {
        productObj = await findOrCreateProduct(sync_product_id, product_name);
        productCache.set(sync_product_id, productObj);
        console.log(`✅ Using product ${productObj.id} for sync_product_id=${sync_product_id}`);
      }

      // 2) Upsert price by SKU
      const existing = await findPriceBySku(skuClean);

      const metadata = {
        // keep your original keys
        sku: skuClean,
        sync_product_id,
        sync_variant_id,
        color,
        size,

        // add keys your webhook/mapping expects
        printful_sku: skuClean,
        printful_sync_product_id: sync_product_id,
        printful_sync_variant_id: sync_variant_id,
        printful_color: color,
        printful_size: size,
      };

      if (existing) {
        // Update price: set lookup_key (if missing) + ensure metadata present
        try {
          const updatePayload = { metadata };

          // Only set lookup_key if it's missing (Stripe may block changing it in some cases)
          if (!existing.lookup_key) updatePayload.lookup_key = skuClean;

          await stripe.prices.update(existing.id, updatePayload);
          console.log(`✅ Updated price ${existing.id} (lookup_key=${existing.lookup_key || skuClean}) for SKU ${skuClean}`);
        } catch (e) {
          console.error(`❌ Failed updating price for SKU ${skuClean}:`, e?.message || e);
        }
        continue;
      }

      // 3) Create new price (use a NEW idempotency key version to avoid returning old objects)
      const idem = `pfv2-${sync_variant_id}-${unit_amount}-${currency}`;

      try {
        const price = await stripe.prices.create(
          {
            product: productObj.id,
            unit_amount,
            currency,
            nickname: `${color} / ${size}`,
            lookup_key: skuClean,
            metadata,
          },
          { idempotencyKey: idem }
        );
        console.log(`✅ Created price ${price.id} for SKU ${skuClean} (${unit_amount} ${currency})`);
      } catch (e) {
        console.error(`❌ Failed creating price for SKU ${skuClean}:`, e?.message || e);
      }
    }

    console.log("🎉 Done upserting Stripe products + prices (lookup_key + Printful metadata).");
  });
