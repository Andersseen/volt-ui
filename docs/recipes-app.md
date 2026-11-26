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

Recipes is the first site to adopt [Doqs](https://github.com/Andersseen/doqs) (`@doqs/analog`, 0.12; now 0.15) — a dogfooding trial before the same is done on voltui.dev.

- Content: `apps/recipes/src/content/docs` (English), `docs-es`, `docs-uk`; matched by slug. Frontmatter `title`, `description`, `group`, `order`.
- Wiring: `src/doq.paths.ts` (paths + locales, shared with `vite.config.ts`), `app.config.ts` (`doqRoutes` registered **before** `withLocalizedRoutes()`, `provideContent`, `provideDoq`), `lib/doq-i18n.ts` (`provideRecipesDoqI18n()`, built on the adapter both apps share in `packages/shared/doqs/etyma-doq-i18n.ts`: the 0.12 `DoqI18nAdapter` reporting Etyma's locale and translating Doqs's interface text from Glossa — `recipes.doqs.*`, plus existing `ui.docs.*`/`ui.copy.*` keys; Etyma keeps owning the URL prefix, `<html lang>`, canonical, hreflang and the one language switcher), `styles.css` (imports `packages/shared/styles/doqs.css`: `--host-docs-*` mapped onto the Volt tokens, so presets and dark mode apply). voltui.dev adopted the same setup in v1.8; see `docs/doqs-docs.md`.
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

## Listings

`/blocks`, `/layouts` and `/patterns` share one `CatalogBrowser` (`components/catalog-browser/`): a
three-catalog explainer, search (name, summary, category and the Volt atoms an entry uses), category
chips and an A–Z sort. The query lives in the URL (`?q=`, `?category=`, `?sort=name`), so filtered
views can be linked and are server-rendered as-is; `catalog-query.ts` holds the pure filtering. The
gallery layout adds `CatalogSidebar` from `lg` up, built on `volt-sidebar-item`. Categories come from
`groupsOf(kind)` in `lib/catalog.ts`; a new block category only needs its entry in
`BLOCK_CATEGORIES` and its Glossa keys.

## Adding a block, layout or recipe

1. Source: `apps/recipes/src/app/{blocks,layouts,patterns}/<name>/<name>.ts`, importing Volt from `'volt'` (rewritten to `@voltui/components` for package mode, and to `Ui*` / `../ui/<component>` for CLI-copy mode) and nothing from the app. A supporting file it imports (`./<name>.data`) sits beside it and is shown under it.
2. Metadata: an entry in `lib/{blocks,layouts,recipes}-metadata.ts` (slug, path, atoms). `lib/catalog.ts` picks it up; routes, cards, sitemap, SEO and redirects derive from the catalog.
3. Source for display: export in `lib/snippets/{blocks,layouts,recipes}.ts` via `?raw` + `toConsumerSource`.
4. Page: `pages/(gallery)/<kind>/<slug>.page.ts` using `app-block-showcase` / `app-layout-showcase` / `app-recipe-showcase`.
5. Copy: Glossa keys through the `glossa` MCP (`blocks.items.*`, `layouts.items.*`). Recipe names are `recipes.items.*`.
6. `pnpm generate:compositions` (the manifest: fails if the page, its preview and its copyable source disagree, or the source imports something a consumer lacks), `pnpm generate:seo-files`, `pnpm check:copied-source` (both modes, CLI copy from the CLI tarball), `pnpm test:e2e:recipes`.

## Distribution modes

Every block, layout and pattern page shows its source as the npm package or as a CLI copy, through the transform the
docs site uses (`packages/shared/lib/distribution.ts`); `components/composition-source.ts` renders it. What is shown is
what is copied, the supporting files follow the same switch, and the install commands change with it: package mode
`pnpm add @voltui/components <packages>`; copy mode `npx @voltui/cli add <components>` then `pnpm add <packages>`, with
the files in `src/app/<folder>/` importing `../ui/<component>`. The choice is one in-memory store
(`packages/shared/services/distribution-mode.ts`), shared across pages; the server always renders package mode.

`packages/shared/lib/compositions.generated.ts` (`pnpm generate:compositions`, checked by `pnpm check:generated`) lists
every composition with its folder, files, Volt components and npm packages, derived from the page. The MCP server's
`find_compositions` reads it; `check:copied-source`, `check:consumer` (isolated, from the tarballs, plus four
compositions built as an onboarding app) and `check:published` (against npm `latest`) compile it in both modes.

The Sidebar layout used to show the library's own `sidebar.ts`: it is now a consumer shell
(`layouts/sidebar/sidebar.ts`) on the public `volt-sidebar` API, like the other layouts.

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

- Per-recipe sentence copy on the listing cards: still not written. The three workflow patterns are explained in the
  `Workflow patterns` guide (`/docs/workflow-patterns`, en/es/uk).
- A dedicated Glossa project for Recipes. Not needed today: the shared header, footer, switchers and SEO use the same `nav.*`/`seo.*` keys in both apps, and one project means one generated contract. Everything Recipes-only lives under `recipes.*`, so it can move out in one step if Recipes grows its own copy.
- Recipes-specific OG image (reuses the docs card).

## Patterns (formerly "Recipes")

The third category is **Patterns** — reusable compositions that demonstrate behaviour over time. The product is still _Volt UI Recipes_.

- Routes are `/patterns` and `/patterns/<slug>`. `/recipes[/<slug>]` (and `/es`, `/uk` prefixes) redirect permanently, straight to the new URL, from `renamedSectionRouteRules` in `packages/shared/legacy-redirects.ts`; Nitro emits them into Cloudflare Pages `_redirects`. `voltui.dev/docs/recipes/*` goes to `/patterns/*` in a single hop.
- Catalog entry ids stay `recipes/<slug>` (stable references), the kind is `patterns`, and the source lives in `src/app/patterns/`.
- The label comes from `gallery.patterns.title` (`KIND_TITLE_KEY`). `recipes.title` still says Recipes on purpose: the footer and docs sidebar use it to name the website.
- Glossa token: `.mcp.json` expands `${GLOSSA_TOKEN}` from the process environment, never from `.env`. If it is only in `.env`, the server gets an empty bearer and answers 401; start the agent with `set -a; source .env; set +a` first.
