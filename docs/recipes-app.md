# Volt UI Recipes (`apps/recipes`)

Second application in this workspace: https://recipes.voltui.dev. Blocks, layouts and recipes moved here from `voltui.dev/docs/{blocks,layouts,recipes}`.

## Commands

```bash
pnpm dev:recipes        # http://localhost:4300
pnpm build:recipes      # dist/apps/recipes/{client,ssr,analog}
pnpm build:all          # docs + Recipes in parallel through Turborepo
pnpm preview:recipes    # wrangler serves dist/apps/recipes/analog/public
pnpm typecheck:recipes
pnpm test:e2e:recipes   # playwright.recipes.config.ts (E2E_SERVER=dev|preview|wrangler)
pnpm check:ssr:recipes  # every route in the worker, fails on a logged error
node scripts/check-seo.mjs --app recipes
```

## Adding a block, layout or recipe

1. Source: `apps/recipes/src/app/{blocks,layouts,recipes}/<name>/<name>.ts`, importing Volt from `'volt'` (rewritten to `@voltui/components` for the copy) and nothing from the app.
2. Metadata: an entry in `lib/{blocks,layouts,recipes}-metadata.ts` (slug, path, atoms). `lib/catalog.ts` picks it up; routes, cards, sitemap, SEO and redirects derive from the catalog.
3. Source for display: export in `lib/snippets/{blocks,layouts,recipes}.ts` via `?raw` + `toConsumerSource`.
4. Page: `pages/(gallery)/<kind>/<slug>.page.ts` using `app-block-showcase` / `app-layout-showcase` / `app-recipe-showcase`.
5. Copy: Glossa keys through the `glossa` MCP (`blocks.items.*`, `layouts.items.*`). Recipes names are literal until keys exist.
6. `pnpm generate:seo-files`, `pnpm check:copied-source` (compiles the copy in a consumer workspace), `pnpm test:e2e:recipes`.

## Deploying (manual steps — not done by the PR)

Owner of production deploys: **GitHub Actions** (`deploy-recipes` in `ci.yml`). Do **not** also connect the Pages project to Git.

1. Cloudflare Pages → create project `volt-ui-recipes` (Direct Upload), production branch `main`.
2. Custom domain `recipes.voltui.dev` on that project (DNS CNAME to `volt-ui-recipes.pages.dev`, proxied).
3. Repo variable `RECIPES_DEPLOY=true`; secrets `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` already serve the other projects.
4. Merge. `deploy-recipes` runs first; `deploy` (docs) waits for it and also probes `https://recipes.voltui.dev/blocks/hero` before publishing, because the docs build 301-redirects the old gallery URLs there. **Never deploy the docs build before Recipes is live.**
5. Previews: PR builds are verified in CI (`recipes` job); no per-PR Pages preview is configured.

Environment variables: none required (Glossa catalogs are public). Optional analytics is not wired for Recipes.

## Deferred / blocked

- Glossa keys for Recipes-specific copy (home hero, recipes index title/description, `Recipes` nav label, per-recipe names/lessons). The Glossa MCP returned 401 in this session, so the UI reuses existing `gallery.*`/`seo.*` keys and the literal proper name "Recipes". Add keys with `glossa`, then swap the literals (search for "no published" comments).
- A dedicated Glossa project for Recipes (both apps share `volt-ui` today).
- Recipes-specific OG image (reuses the docs card).
