# Fulfillment providers (Printful + local shop)

Your store talks to vendors through a small **provider interface** so checkout stays the same.

```
lib/fulfillment/
  index.js                 → getFulfillmentProvider('printful' | 'local')
  providers/base.js        → contract
  providers/printful.js    → Printful API
  providers/localShop.js   → Supabase queue (Vendor POD Console)
```

## Default behavior

- **Default provider = Printful** (`FULFILLMENT_PROVIDER` unset or `printful`)
- Existing Stripe → Printful webhook path is **unchanged** until you deliberately call the local provider or set env

## Env

```
# optional — only if you want local as default (not recommended until ready)
FULFILLMENT_PROVIDER=printful

# local portal + webhooks
SHOP_PORTAL_PASSWORD=...
SHOP_WEBHOOK_SECRET=...          # optional; falls back to SHOP_PORTAL_PASSWORD
```

## Usage (server-only)

```js
import { getFulfillmentProvider } from "../lib/fulfillment";

// Live path today — same as before conceptually
const printful = getFulfillmentProvider("printful");
await printful.createOrder({ storeOrderId, items, shipping });

// Local vendor — shows up in /shop-portal queue
const local = getFulfillmentProvider("local");
await local.createOrder({ storeOrderId, items, shipping });
```

### Item shapes

**Printful items:** `{ sync_variant_id, quantity }`  
**Local items:** `{ local_sku|sku, name, quantity, print_file_url? }`

## Shop → store webhook

When the shop (or any system) reports status:

`POST /api/webhooks/shop`

Headers:
```
Authorization: Bearer <SHOP_WEBHOOK_SECRET>
```
or `x-shop-webhook-secret: <secret>`

Body:
```json
{
  "externalOrderId": "cs_test_...",
  "status": "shipped",
  "carrier": "USPS",
  "tracking": "9400..."
}
```

Statuses accepted: `new` / `printing` / `shipped` / `hold` (mapped to `local_*`).

The Vendor POD Console **Mark shipped** button already updates Supabase directly; this webhook is for external tools or a future separate shop server.

## Related

- Shop UI: `/shop-portal` (Queue + Catalog)
- Catalog SQL: `docs/VENDOR-CATALOG.md`
- Install for the shop: `docs/VENDOR-POD-INSTALL.md`

## Safe rollout

1. Keep `FULFILLMENT_PROVIDER=printful` (or unset)
2. Practice on `/shop-portal` with **Demo ticket**
3. Fill `local_catalog`
4. Later: call `getFulfillmentProvider('local')` for specific SKUs only
