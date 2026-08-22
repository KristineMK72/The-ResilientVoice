# Local vendor catalog (Printful-like)

Mirror the useful parts of Printful for **one local print shop**:

1. **Catalog** — what they can print (blanks + your designs)
2. **Queue** — orders assigned to them
3. **Status** — queue → printing → shipped

Printful remains your national/default vendor. This is a second, viewable inventory of *local capacity*.

---

## Supabase tables

Run in SQL editor:

```sql
-- What the local shop can produce
create table if not exists local_catalog (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  title text not null,
  description text,
  category text, -- grace | patriot | social | blank | other
  blank_type text, -- e.g. unisex tee, hoodie
  colors text[] default '{}',
  sizes text[] default '{}',
  print_file_url text, -- PNG/PDF for production
  mockup_url text, -- storefront-style preview
  base_cost_cents int, -- what you pay the shop
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists local_catalog_active_idx on local_catalog (active);
create index if not exists local_catalog_category_idx on local_catalog (category);
```

Optional: link a web order line to a local SKU later via `order_items.local_sku`.

---

## APIs

| Method | Path | Who |
|--------|------|-----|
| GET | `/api/shop-portal/catalog` | Shop (password) — **viewable items** |
| GET | `/api/vendor/catalog?active=1` | You / public read of active local items |
| POST | `/api/vendor/catalog` | You (admin password) — add/update item |

Admin write uses header `x-vendor-admin-password` = `VENDOR_ADMIN_PASSWORD` (or falls back to `SHOP_PORTAL_PASSWORD`).

---

## Env

```
SHOP_PORTAL_PASSWORD=...
VENDOR_ADMIN_PASSWORD=...   # optional separate key for adding catalog rows
```

---

## Shop portal

Tabs: **Queue** | **Catalog**  
Catalog shows every **active** local item: mockup, colors, sizes, download print file.

---

## Closer to Printful — roadmap

| Printful concept | Local equivalent |
|------------------|------------------|
| Sync products | `local_catalog` rows |
| Variants (color/size) | `colors[]` + `sizes[]` |
| Print files | `print_file_url` |
| Orders API | existing `orders` + portal queue |
| Webhooks | email/Slack on new local job (next) |
| Shipping | shop enters tracking |

---

## Seed example

```sql
insert into local_catalog (sku, title, category, blank_type, colors, sizes, active)
values
  ('GG-LOCAL-FAITH-TEE', 'Faith Tee (local)', 'grace', 'unisex tee', array['Black','White'], array['S','M','L','XL'], true),
  ('GG-LOCAL-PATRIOT-TEE', 'Patriot Tee (local)', 'patriot', 'unisex tee', array['Navy','Black'], array['S','M','L','XL','2XL'], true);
```
