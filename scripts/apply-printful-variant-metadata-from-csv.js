import fs from "fs";
import csv from "csv-parser";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CSV_PATH = "printful_variants.csv";

function cleanSku(s) {
  return String(s || "").trim();
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
  let missing = 0;

  for (const row of rows) {
    const printfulSyncProductId = row.sync_product_id || row.sync_product;
    const printfulSyncVariantId = row.sync_variant_id || row.sync_variant;
    const color = row.color;
    const size = row.size;
    const sku = cleanSku(row.sku);

    if (!sku || !printfulSyncVariantId) continue;

    const price = await findPriceByLookupKey(sku);

    if (!price) {
      console.warn(`⚠️ No Stripe price found for lookup_key (sku) = ${sku}`);
      missing++;
      continue;
    }

    const newMeta = {
      ...(price.metadata || {}),
      printful_sync_variant_id: String(printfulSyncVariantId),
      ...(printfulSyncProductId
        ? { printful_sync_product_id: String(printfulSyncProductId) }
        : {}),
      ...(color ? { printful_color: String(color) } : {}),
      ...(size ? { printful_size: String(size) } : {}),
      printful_sku: sku,
    };

    await stripe.prices.update(price.id, { metadata: newMeta });

    updated++;
    console.log(
      `✅ Updated ${price.id} (sku=${sku}) -> variant=${printfulSyncVariantId}`
    );

    // light throttle
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log(`\nDone. Updated: ${updated}, Missing Stripe price: ${missing}`);
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
