# Vendor POD Console — install guide

Software for a **local print shop** to run print-on-demand jobs for Grit & Grace (and later other brands).

**Printful is not changed.** This is a second vendor channel you turn on when you’re ready.

---

## What the shop gets

| Piece | URL / tool |
|--------|------------|
| Production queue | `https://gritandgrace.buzz/shop-portal` |
| Login | Password you set in Vercel |
| Actions | Queue → Printing → Shipped (+ tracking) or Hold |

They do **not** need GitHub, Stripe, or Printful access.

---

## What you (Kristine) set up once

### 1. Vercel environment variables

In the Grit & Grace project on Vercel → Settings → Environment Variables:

```
SHOP_PORTAL_PASSWORD=long-random-password-share-only-with-shop
```

Redeploy after saving.

Optional (only when you intentionally send jobs to this shop instead of Printful):

```
LOCAL_POD_ENABLED=true
```

**Leave `LOCAL_POD_ENABLED` unset** until you and the shop have practiced on demo tickets.

### 2. Supabase (optional columns)

In Supabase SQL editor:

```sql
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists shop_notes text;
alter table orders add column if not exists fulfilled_at timestamptz;
alter table orders add column if not exists fulfillment_channel text default 'printful';
```

Existing `orders` + `order_items` tables are enough to start.

### 3. Give the shop

- Link: **https://gritandgrace.buzz/shop-portal**
- Password: the value of `SHOP_PORTAL_PASSWORD`
- Shared Drive/Dropbox of **print-ready files** (by product name or SKU)
- Agreement: blanks, turnaround days, your cost per unit, who buys shipping labels

---

## Walkthrough with the shop (30–45 min)

1. Open `/shop-portal` on their computer; log in with the password.  
2. Create a **demo ticket** (button in the portal) so they see a fake order.  
3. Practice: **Printing** → **Mark shipped** (enter a fake tracking #).  
4. Show **Hold** for missing blank / bad address.  
5. Confirm how they’ll get real print files (shared folder for now).  
6. Agree who checks the queue each morning.

---

## When real orders should go to this vendor

Only after a successful practice week:

1. Decide: *all* web orders local, or only certain SKUs (phase 2).  
2. Set routing (you’ll turn on a flag or assign channel — **not required for install day**).  
3. Keep Printful as backup for overflow / out-of-area if needed.

Until routing is on, demo tickets + manual status practice are enough for install day.

---

## Security notes

- Don’t put the shop password in the public README or Instagram.  
- Rotate `SHOP_PORTAL_PASSWORD` if someone leaves the shop.  
- Portal only sees order/shipping fields needed to print and ship — not full Stripe keys.

---

## Support checklist

- [ ] Password works on shop PC and phone  
- [ ] Demo ticket appears in **Open**  
- [ ] Status buttons update the card  
- [ ] Print file folder is bookmarked  
- [ ] Your cell/email for “Hold” questions  

Built for: **one vendor shop + your store**. Multi-brand SaaS can come later if this workflow sticks.
