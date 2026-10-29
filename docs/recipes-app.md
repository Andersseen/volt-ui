# Volt UI Recipes (`apps/recipes`)

Second application in this workspace: https://recipes.voltui.dev. Blocks, layouts and recipes moved here from `voltui.dev/docs/{blocks,layouts,recipes}`.

## Commands

```bash
pnpm dev:recipes        # http://localhost:4300
pnpm build:recipes      # dist/apps/recipes/{client,ssr,analog}
pnpm build:all          # docs (apps/web) + Recipes in parallel through Turborepo
pnpm preview:recipes    # wrangler serves dist/apps/recipes/analog/public
pnpm typecheck:recipes
pnpm test:e2e:recipes   # playwright.recipes.config.ts (E2E_SERVER=dev|preview|wrangler)
pnpm check:ssr:recipes  # every route in the worker, fails on a logged error
node scripts/check-seo.mjs --app recipes
```

## Documentation with Doqs (`/docs`)

Recipes is the first site to adopt [Doqs](https://github.com/Andersseen/doqs) (`@doqs/analog`, 0.12) — a dogfooding trial before the same is done on voltui.dev.

- Content: `apps/recipes/src/content/docs` (English), `docs-es`, `docs-uk`; matched by slug. Frontmatter `title`, `description`, `group`, `order`.
- Wiring: `src/doq.paths.ts` (paths + locales, shared with `vite.config.ts`), `app.config.ts` (`doqRoutes` registered **before** `withLocalizedRoutes()`, `provideContent`, `provideDoq`), `lib/doq-i18n.ts` (`provideEtymaDoqI18n()`: the 0.12 `DoqI18nAdapter` reporting Etyma's locale and translating Doqs's interface text from Glossa — `recipes.doqs.*`, plus existing `ui.docs.*`/`ui.copy.*` keys; Etyma keeps owning the URL prefix, `<html lang>`, canonical, hreflang and the one language switcher), `styles.css` (`--host-docs-*` mapped onto the Volt tokens, so presets and dark mode apply).
- SEO: `lib/seo/docs-pages.ts` reads each file's frontmatter, so the page head, sitemap and `llms.txt` use the title/description the reader sees, in each language. `/docs` (the index) stays `noindex`.
- A live recipe inside a guide: `::demo[async-search]` (registered in `app.config.ts`).
- Prerendering: `doqPrerenderRoutes(doqPaths)` prerenders every doc page in all three languages; the catalog pages stay server-rendered.

Findings for Doqs (to take to the voltui.dev adoption):

1. Doqs always renders its own language selector when more than one locale is published, even with `ownsRouting: true`; a host that already has a switcher ends up with two. Recipes hides `doq-locale-switcher` in `styles.css`. Worth an option upstream (or hiding it whenever `ownsRouting` is set).
1. `ownsRouting: true` is not enough for a client-side language switch: Etyma activates a non-source locale in a `canActivate` guard on the routes `withLocalizedRoutes()` builds, and Doqs registers `/es/docs/*` outside them. Switching to Spanish on a guide moved the URL and the Markdown but left the header and Doqs chrome in English (a direct load was fine). `withEtymaLocale()` in `lib/doq-i18n.ts` adds that guard to each Doqs route — not to an empty-path parent around them, which Angular matches for `/` and renders nothing. Doqs could accept a route guard (or `canActivate`) in its config.
1. `DoqI18nAdapter.translate` covers every Doqs string, but `provideDoqI18n(adapter)` takes a value, so an adapter that injects the host's i18n (Etyma) needs its own factory provider. A `provideDoqI18n(() => adapter)` overload would remove that. Doqs placeholders are `{label}`; Glossa/MF2 are `{$label}`, so the adapter passes params through `t()` rather than formatting the Doqs fallback.
1. `unmatched: 'continue'` leaves the bare `/docs` empty when the host has no page there; Recipes uses the default and lets Doqs render its index.
1. `index.md` produces both `/docs` and a duplicate `/docs/index`; Recipes names it `introduction.md`.
1. Doqs only sets a generic head, so the host's SEO service must own titles/descriptions/JSON-LD (done in `seo.provider.ts`).
1. Vitest 5's module cache breaks Angular JIT inline styles after the first run; `fsModuleCache: false` in `vitest.config.ts`.

## Adding a block, layout or recipe

1. Source: `apps/recipes/src/app/{blocks,layouts,recipes}/<name>/<name>.ts`, importing Volt from `'volt'` (rewritten to `@voltui/components` for the copy) and nothing from the app.
2. Metadata: an entry in `lib/{blocks,layouts,recipes}-metadata.ts` (slug, path, atoms). `lib/catalog.ts` picks it up; routes, cards, sitemap, SEO and redirects derive from the catalog.
3. Source for display: export in `lib/snippets/{blocks,layouts,recipes}.ts` via `?raw` + `toConsumerSource`.
4. Page: `pages/(gallery)/<kind>/<slug>.page.ts` using `app-block-showcase` / `app-layout-showcase` / `app-recipe-showcase`.
5. Copy: Glossa keys through the `glossa` MCP (`blocks.items.*`, `layouts.items.*`). Recipe names are `recipes.items.*`.
6. `pnpm generate:seo-files`, `pnpm check:copied-source` (compiles the copy in a consumer workspace), `pnpm test:e2e:recipes`.

## Deploying (manual steps — not done by the PR)

Owner of production deploys: **GitHub Actions** (`deploy-recipes` in `ci.yml`). Do **not** also connect the Pages project to Git.

1. Cloudflare Pages → create project `volt-ui-recipes` (Direct Upload), production branch `main`.
2. Custom domain `recipes.voltui.dev` on that project (DNS CNAME to `volt-ui-recipes.pages.dev`, proxied). Adding the domain in Pages does not create the record when the token lacks DNS access: until the CNAME exists the domain stays `pending` and the docs deploy fails its probe.
3. Repo variable `RECIPES_DEPLOY=true`; secrets `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` already serve the other projects.
4. Merge. `deploy-recipes` runs first; `deploy` (docs) waits for it and also probes `https://recipes.voltui.dev/blocks/hero` before publishing, because the docs build 301-redirects the old gallery URLs there. **Never deploy the docs build before Recipes is live.**
5. Previews: PR builds are verified in CI (`recipes` job); no per-PR Pages preview is configured.

Each app has its own `wrangler.toml` (`apps/web/`, `apps/recipes/`: project name, compatibility date, output directory). Every `wrangler pages` command — the CI deploys, `pnpm preview`, the `wrangler` e2e mode, `check:ssr`, `check:seo` — runs from that app's folder so its file applies; run from the repository root, wrangler would find no config and fall back to the dashboard's settings.

Environment variables: none required (Glossa catalogs are public). Optional analytics is not wired for Recipes.

## Deferred / blocked

- Per-recipe sentence copy (what each recipe teaches, when to use it): not written yet.
- A dedicated Glossa project for Recipes. Not needed today: the shared header, footer, switchers and SEO use the same `nav.*`/`seo.*` keys in both apps, and one project means one generated contract. Everything Recipes-only lives under `recipes.*`, so it can move out in one step if Recipes grows its own copy.
- Recipes-specific OG image (reuses the docs card).
