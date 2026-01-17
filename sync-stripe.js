const Stripe = require('stripe');
const stripe = new Stripe('sk_live_YOUR_SECRET_KEY'); // 1. Use your Secret Key

const printfulMapping = {
  "693DCAD2B3FA5_2XL": "5106472206",
  "693DCAD2B3FA5_3XL": "5106472207",
  "6939F89B27693_S": "5100396130",
  "6939F89B27693_M": "5100396131",
  "6939F89B27693_L": "5100396132",
  "6939F89B27693_XL": "5100396133",
  "6939F89B27693_2XL": "5100396134",
  "6939F89B27693_3XL": "5100396135",
  "693595799B4A7_S": "5092811008",
  "693595799B4A7_M": "5092811009",
  "693595799B4A7_L": "5092811010",
  "693595799B4A7_XL": "5092811011",
  "693595799B4A7_2XL": "5092811012",
  "693595799B4A7_3XL": "5092811013",
  "693590C4CC312_2XS": "5092796955",
  "693590C4CC312_XS": "5092796956",
  "693590C4CC312_S": "5092796957",
  "693590C4CC312_M": "5092796958",
  "693590C4CC312_L": "5092796959",
  "693590C4CC312_XL": "5092796960",
  "693590C4CC312_2XL": "5092796961",
  "693590C4CC312_3XL": "5092796962",
  "69358C682FBB1_2XS": "5092769335",
  "69358C682FBB1_XS": "5092769336",
  "69358C682FBB1_S": "5092769337",
  "69358C682FBB1_M": "5092769338",
  "69358C682FBB1_L": "5092769339",
  "69358C682FBB1_XL": "5092769340",
  "69358C682FBB1_2XL": "5092769341",
  "69358C682FBB1_3XL": "5092769342",
  "693589F3494A1_S": "5092763495",
  "693589F3494A1_M": "5092763496",
  "693589F3494A1_L": "5092763497",
  "693589F3494A1_XL": "5092763498",
  "693589F3494A1_2XL": "5092763499",
  "693589F3494A1_3XL": "5092763500",
  "6935101186146_S": "5092361090",
  "6935101186146_M": "5092361091",
  "6935101186146_L": "5092361092",
  "6935101186146_XL": "5092361093",
  "6935101186146_2XL": "5092361094",
  "6935101186146_3XL": "5092361095",
  "69350C395F24C_S": "5092355163",
  "69350C395F24C_M": "5092355164",
  "69350C395F24C_L": "5092355165",
  "69350C395F24C_XL": "5092355166",
  "69350C395F24C_2XL": "5092355167",
  "69350C395F24C_3XL": "5092355168",
  "69316CD0F22C9_S": "5088154842",
  "69316CD0F22C9_M": "5088154843",
  "69316CD0F22C9_L": "5088154844",
  "69316CD0F22C9_XL": "5088154845",
  "69316CD0F22C9_2XL": "5088154846",
  "69316CD0F22C9_3XL": "5088154847",
  "6912C34C062BF_S": "5053532584",
  "6912C34C062BF_M": "5053532585",
  "6912C34C062BF_L": "5053532586",
  "6913E0DF54D3C": "5055669270"
};

async function syncAll() {
  console.log("🚀 Starting Bulk Metadata Sync...");
  let count = 0;

  for await (const price of stripe.prices.list({ expand: ['data.product'] })) {
    // Check lookup_key or metadata on the Price OR the Product
    const sku = price.lookup_key || price.metadata.sku || (price.product && price.product.metadata.sku);

    if (sku && printfulMapping[sku]) {
      const syncId = printfulMapping[sku];
      console.log(`✅ Updating Price: ${price.id} | SKU: ${sku} -> ID: ${syncId}`);

      await stripe.prices.update(price.id, {
        metadata: { sync_variant_id: syncId }
      });
      count++;
    }
  }
  console.log(`\n✨ Finished! Updated ${count} Price variants.`);
}

syncAll().catch(err => console.error("❌ Sync failed:", err));
