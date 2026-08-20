# Grit & Grace upgrade branch

Branch: `upgrade/primo-foundation`

This branch adds foundations for TypeScript, auto catalog sync, premium UI, and story/lookbook — without replacing your live pages yet.

## Packages included

| Area | Paths |
|------|--------|
| TypeScript | `tsconfig.json`, `types/`, `data/products.ts`, typed helpers |
| Auto-sync | `lib/sync/*`, `pages/api/sync/full.js`, updated Printful webhook |
| Primo UI | `styles/tokens.css`, `styles/global.css`, `components/HeaderPrimo.js`, `components/FooterPrimo.js`, `components/ui/*` |
| Story / Lookbook | `types/story.ts`, `lib/story.ts`, `lib/lookbook.ts`, `lib/productImage.ts` |
| Examples | `pages/*.example.*` — templates to merge when ready |

## Safe rollout

1. Review this branch in a PR — do not merge blindly to `main` if production is live.
2. Install TypeScript deps if adopting TS: see `docs/TYPESCRIPT.md` or package notes.
3. Env vars for sync: `SYNC_SECRET`, existing Printful / Supabase / Stripe keys.
4. Wire primo CSS in `_app` only after visual QA on staging.
5. Point collection pages at Supabase categories after sync is running.

## Docs

- Auto-sync: `docs/AUTO-SYNC.md`
- Primo UI: `docs/PRIMO-UI.md`
- Story / mockups: `docs/STORY-LOOKBOOK.md`
- TypeScript: `docs/TYPESCRIPT.md`

Built for The Resilient Voice · Grit & Grace.
