# TypeScript foundation — Grit & Grace / The Resilient Voice

Drop these files into the root of `The-ResilientVoice` (or merge the pieces into existing paths).

## 1. Install TypeScript

From the project root:

```bash
npm install -D typescript @types/react @types/react-dom @types/node
```

Or replace your `package.json` with the one in this folder (then `npm install`).

## 2. Copy config + types

| File | Action |
|------|--------|
| `tsconfig.json` | Project root |
| `next-env.d.ts` | Project root (Next may regenerate this) |
| `types/product.ts` | Create `types/` folder |
| `types/cart.ts` | Create `types/` folder |
| `types/index.ts` | Create `types/` folder |

## 3. Replace / add typed libs

| File | Action |
|------|--------|
| `lib/formatPrice.ts` | Add (keep or delete old `.js`) |
| `lib/supabase-browser.ts` | Replace `lib/supabase-browser.js` — exports both `supabaseBrowser` and `createSupabaseBrowserClient` (fixes ProductGrid import) |
| `data/products.ts` | Replace `data/products.js` |

After adding `.ts` versions, delete the old `.js` files for the same modules so you don’t have duplicates.

## 4. Type the big catalog map (optional next step)

Keep `lib/printfulMap.js` for now, or rename to `lib/printfulMap.ts` and add:

```ts
import type { PrintfulProductMapEntry, ProductCategory } from "@/types/product";

export const PRINTFUL_PRODUCTS: Record<string, PrintfulProductMapEntry> = {
  // ... existing entries — ensure category is "grace" | "patriot" | "social"
};
```

Fix any `category` values that aren’t one of those three strings.

## 5. Verify

```bash
npm run typecheck
# or
npx tsc --noEmit
```

Then:

```bash
npm run dev
```

Next.js supports mixed JS/TS, so the rest of the site keeps working while you convert files over time.

## Suggested conversion order

1. Done: types, `products.ts`, `formatPrice.ts`, `supabase-browser.ts`
2. `lib/printfulMap.ts`
3. `components/ProductGrid.tsx` (import types from `@/types`)
4. Product page + cart page
5. Homepage + Header when you touch them

## Notes

- `"allowJs": true` lets existing `.js` files keep compiling.
- Path alias `@/*` matches what `ProductGrid` already uses.
- `createSupabaseBrowserClient` was missing from the old JS file; the new TS module exports it so that import works.
