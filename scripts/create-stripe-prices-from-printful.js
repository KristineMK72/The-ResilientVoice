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
const num = (v) => {
  const n = Number(clean(v));
  return Number.isFinite(n) ? n : null;
};

async function findOrCreateProduct(sync_product_id, product_name) {
  try {
    const q = `metadata['sync_product_id']:'${sync_product_id}'`;
    const found = await stripe.products.search({ query: q, limit: 1 });
    if (found.data?.length) return found.data[0];
  } catch {
    // ignore and create
  }

  return stripe.products.create({
    name: product_name || `Printful Product ${sync_product_id}`,
    metadata: { sync_product_id: String(sync_product_id) },
  });
}

async function findPriceBySku(sku) {
  // 1) lookup_key is the best
  try {
    const byLookup = await stripe.prices.list({ lookup_keys: [sku], limit: 1 });
    if (byLookup.data?.length) return byLookup.data[0];
  } catch {
    // ignore
  }

  // 2) fallback: metadata.sku search
  try {
    const q = `metadata['sku']:'${sku}'`;
    const found = await stripe.prices.search({ query: q, limit: 1 });
    if (found.data?.length) return found.data[0];
  } catch {
    // ignore
  }

  return null;
}

function buildMetadata({ sku, sync_product_id, sync_variant_id, color, size }) {
  return {
    // your original keys
    sku,
    sync_product_id: String(sync_product_id),
    sync_variant_id: String(sync_variant_id),
    color,
    size,

    // keys your webhook/mapping expects
    printful_sku: sku,
    printful_sync_product_id: String(sync_product_id),
    printful_sync_variant_id: String(sync_variant_id),
    printful_color: color,
    printful_size: size,
  };
}

const rows = [];
fs.createReadStream("printful_variants.csv")
  .pipe(csv())
  .on("data", (r) => rows.push(r))
  .on("end", async () => {
    console.log(`Found ${rows.length} variants in CSV`);

    const productCache = new Map();

    let created = 0;
    let updated = 0;
    let replaced = 0;
    let skipped = 0;

    for (const r of rows) {
      const sync_product_id = clean(r.sync_product_id);
      const product_name = clean(r.product_name);
      const sync_variant_id = clean(r.sync_variant_id);
      const color = clean(r.color);
      const size = clean(r.size);
      const sku = clean(r.sku);

      const retail_price = num(r.retail_price);
      const currency = (clean(r.currency) || "usd").toLowerCase();

      if (!sync_product_id || !sync_variant_id || !sku || retail_price == null) {
        console.log(`⚠️ Skipping row missing fields: sku=${sku} price=${retail_price}`);
        skipped++;
        continue;
      }

      const unit_amount = Math.round(retail_price * 100);
      if (!Number.isFinite(unit_amount) || unit_amount <= 0) {
        console.log(`⚠️ Skipping invalid amount for SKU ${sku}: ${retail_price}`);
        skipped++;
        continue;
      }

      // 1) Ensure product exists (one per sync_product_id)
      let productObj = productCache.get(sync_product_id);
      if (!productObj) {
        productObj = await findOrCreateProduct(sync_product_id, product_name);
        productCache.set(sync_product_id, productObj);
        console.log(`✅ Using product ${productObj.id} for sync_product_id=${sync_product_id}`);
      }

      // 2) Find existing Stripe price for this SKU
      const existing = await findPriceBySku(sku);
      const metadata = buildMetadata({ sku, sync_product_id, sync_variant_id, color, size });

      if (existing) {
        const existingAmount = existing.unit_amount ?? null;
        const existingCurrency = (existing.currency || "").toLowerCase();

        // Always make sure metadata is up to date
        try {
          await stripe.prices.update(existing.id, { metadata });
          updated++;
        } catch (e) {
          console.error(`❌ Failed updating metadata for SKU ${sku}:`, e?.message || e);
        }

        const amountChanged = existingAmount !== unit_amount;
        const currencyChanged = existingCurrency !== currency;

        // IMPORTANT: if amount/currency changed, Stripe requires a NEW price
        if (amountChanged || currencyChanged) {
          const idem = `pfv3-${sync_variant_id}-${unit_amount}-${currency}`;

          try {
            // Create new price
            const price = await stripe.prices.create(
              {
                product: productObj.id,
                unit_amount,
                currency,
                nickname: `${color} / ${size}`,
                lookup_key: sku,
                metadata,
              },
              { idempotencyKey: idem }
            );

            // Deactivate old one
            await stripe.prices.update(existing.id, { active: false });

            replaced++;
            console.log(
              `♻️ Replaced price for SKU ${sku}: old=${existing.id} (${existingAmount} ${existingCurrency}) → new=${price.id} (${unit_amount} ${currency})`
            );
          } catch (e) {
            console.error(`❌ Failed replacing price for SKU ${sku}:`, e?.message || e);
          }
        } else {
          console.log(`✅ OK SKU ${sku} (price unchanged)`);
        }

        continue;
      }

      // 3) Create new price if missing
      const idem = `pfv3-${sync_variant_id}-${unit_amount}-${currency}`;
      try {
        const price = await stripe.prices.create(
          {
            product: productObj.id,
            unit_amount,
            currency,
            nickname: `${color} / ${size}`,
            lookup_key: sku,
            metadata,
          },
          { idempotencyKey: idem }
        );
        created++;
        console.log(`✅ Created price ${price.id} for SKU ${sku} (${unit_amount} ${currency})`);
      } catch (e) {
        console.error(`❌ Failed creating price for SKU ${sku}:`, e?.message || e);
      }
    }

    console.log("\n🎉 Done.");
    console.log({ created, updated, replaced, skipped });
  });
