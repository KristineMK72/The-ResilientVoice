import fs from "fs";
import csv from "csv-parser";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CSV_PATH = "printful_variants.csv";
const TABLE = "printful_variants"; // <-- your Supabase table name (change if different)

function toNull(v) {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

function toNumberOrNull(v) {
  const s = toNull(v);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV not found: ${CSV_PATH} (run from repo root)`);
    process.exit(1);
  }

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => {
        rows.push({
          sync_product_id: toNumberOrNull(row.sync_product_id),
          product_name: toNull(row.product_name),
          sync_variant_id: toNumberOrNull(row.sync_variant_id),
          color: toNull(row.color),
          size: toNull(row.size),
          sku: toNull(row.sku),
          retail_price: toNull(row.retail_price),
          currency: toNull(row.currency),
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Loaded ${rows.length} rows from ${CSV_PATH}`);

  // chunked upserts
  const chunkSize = 500;
  let ok = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);

    const { error } = await supabase
      .from(TABLE)
      .upsert(chunk, { onConflict: "sync_variant_id" }); // requires unique index on sync_variant_id

    if (error) {
      console.error("❌ Supabase upsert error:", error);
      process.exit(1);
    }

    ok += chunk.length;
    console.log(`✅ Upserted ${ok}/${rows.length}`);
  }

  console.log("🎉 Import complete!");
}

main().catch((e) => {
  console.error("❌ Import failed:", e);
  process.exit(1);
});
