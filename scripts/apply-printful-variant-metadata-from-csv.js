// scripts/apply-printful-variant-metadata-from-csv.js
import fs from "fs";
import csv from "csv-parser";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CSV_PATH = process.env.CSV_PATH || "printful_variants.csv";

function clean(s) {
  return String(s ?? "").trim();
}

async function findPriceByLookupKey(lookupKey) {
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  });
  return prices.data?.[0] || null;
}

async function main() {
  const rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Found ${rows.length} rows in ${CSV_PATH}`);

  let updated = 0;
  let missingPrice = 0;
  let missingVariant = 0;

  for (const row of rows) {
    const sku = clean(row.sku);
    const syncProductId = clean(row.sync_product_id);
    const syncVariantId = clean(row.sync_variant_id);
    const color = clean(row.color);
    const size = clean(row.size);

    if (!sku) continue;

    if (!syncVariantId) {
      console.warn(`⚠️ Missing sync_variant_id in CSV for sku=${sku}`);
      missingVariant++;
      continue;
    }

    const price = await findPriceByLookupKey(sku);

    if (!price) {
      console.warn(`⚠️ No Stripe price found for lookup_key=${sku}`);
      missingPrice++;
      continue;
    }

    const newMeta = {
      ...(price.metadata || {}),
      printful_sku: sku,
      printful_sync_product_id: syncProductId || undefined,
      printful_sync_variant_id: syncVariantId, // keep as string (full ID)
      printful_color: color || undefined,
      printful_size: size || undefined,
    };

    // remove undefined keys (Stripe metadata must be strings)
    Object.keys(newMeta).forEach((k) => {
      if (newMeta[k] === undefined) delete newMeta[k];
      else newMeta[k] = String(newMeta[k]);
    });

    await stripe.prices.update(price.id, { metadata: newMeta });

    updated++;
    console.log(`✅ ${price.id} sku=${sku} -> variant=${syncVariantId}`);
  }

  console.log(
    `\nDone. Updated: ${updated}, Missing Stripe price: ${missingPrice}, Missing variant in CSV: ${missingVariant}`
  );
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
