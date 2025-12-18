import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Missing STRIPE_SECRET_KEY");
  process.exit(1);
}
const stripe = new Stripe(key);

const counts = new Map();
let starting_after;
let total = 0;

while (true) {
  const page = await stripe.prices.list({ limit: 100, starting_after });
  if (!page.data.length) break;

  for (const p of page.data) {
    const sv =
      p.metadata?.printful_sync_variant_id ||
      p.metadata?.sync_variant_id;

    if (sv) counts.set(String(sv), (counts.get(String(sv)) || 0) + 1);
    total++;
  }

  starting_after = page.data[page.data.length - 1].id;
  if (!page.has_more) break;
}

const dups = [...counts.entries()].filter(([_, c]) => c > 1);

console.log("Total Stripe prices scanned:", total);
console.log("Duplicate Printful variant IDs:", dups.length);
console.log("Sample duplicates:", dups.slice(0, 10));
