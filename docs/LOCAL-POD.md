# Local POD — partner shop portal

Route Grit & Grace orders to a **local print shop** instead of (or alongside) Printful.

## Flow

1. Customer pays on gritandgrace.buzz (Stripe)
2. Webhook writes the order to Supabase `orders` + `order_items`
3. If local POD is enabled, order is **not** sent to Printful — status becomes `local_queue`
4. Shop opens **`/shop-portal`**, sees the queue, prints, marks **Shipped** + tracking

## Env vars (Vercel)

```
SHOP_PORTAL_PASSWORD=choose-a-strong-password
LOCAL_POD_ENABLED=true
```

Optional later:

```
LOCAL_POD_ONLY_SKUS=sku1,sku2   # only these go local; rest stay Printful
```

- `LOCAL_POD_ENABLED=true` → **all** paid orders queue for local (Printful skipped)
- Leave unset/`false` → current Printful behavior unchanged

## Supabase

Your existing `orders` table already has what the portal needs:

- `stripe_session_id`, `customer_name`, `customer_email`
- `ship_*` / `shipping_address`
- `items`, `fulfillment_status`
- `amount_total`, `currency`, `created_at` / `updated_at`

Optional columns (run in SQL editor if you want tracking + notes):

```sql
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists shop_notes text;
alter table orders add column if not exists fulfilled_at timestamptz;
alter table orders add column if not exists fulfillment_channel text default 'printful';
```

## Shop login

1. Deploy with `SHOP_PORTAL_PASSWORD` set
2. Share **https://gritandgrace.buzz/shop-portal** with the shop
3. They enter the password (stored in `sessionStorage` for the browser session)

## Statuses used by the portal

| Status | Meaning |
|--------|--------|
| `local_queue` | New — needs print |
| `local_printing` | In production |
| `local_shipped` | Done (tracking optional) |
| `local_hold` | Problem / waiting on you |

## Agreement checklist with the shop

- [ ] Blanks (brand/style) they can stock or order
- [ ] Your print-ready file folder (PNG/PDF per design)
- [ ] Turnaround (e.g. 3–5 business days)
- [ ] Your cost per unit / who pays shipping labels
- [ ] Who enters tracking in the portal

## Print files

Until you automate file links, keep a shared Drive/Dropbox folder named by product title or SKU. Phase 2: store `print_file_url` on each catalog row and show a Download button in the portal.
