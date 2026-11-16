# Doqs on voltui.dev

voltui.dev serves part of its documentation through [Doqs](https://github.com/Andersseen/doqs)
(`@doqs/analog` 0.15), the Markdown documentation framework Recipes already uses for its `/docs`.
Pages move from hand-written Angular pages to Markdown one at a time, at the URLs they already have.
This file is the architecture, the migration matrix and the procedure for the next batch.

## Architecture

| Piece                                    | Where                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| Paths and locales (no Angular)           | `apps/web/src/doq.paths.ts`                                                 |
| Eager route: claims only `/docs/<page>`  | `apps/web/src/app/doqs/doq-region.ts` (`DOQ_REGION_ROUTE`)                  |
| Lazy region: routes, providers           | `apps/web/src/app/doqs/doq.routes.ts`                                       |
| Configuration, demos, playgrounds        | `apps/web/src/app/doqs/doq.config.ts`                                       |
| Doqs interface text (Glossa)             | `apps/web/src/app/doqs/doq-messages.ts`, `doqs.playground.*` keys           |
| Etyma ↔ Doqs adapter (shared w/ Recipes) | `packages/shared/doqs/etyma-doq-i18n.ts`                                    |
| `--host-docs-*` → Volt tokens            | `packages/shared/styles/doqs.css`                                           |
| Authored Markdown (source of truth)      | `apps/web/src/authoring/docs`, `docs-es`, `docs-uk`                         |
| Resolved Markdown (generated, committed) | `apps/web/src/content/docs*` — `pnpm docs:content`; CI `docs:content:check` |
| Live examples shown as their own source  | `apps/web/src/app/doqs/examples/` (`::demo` + `::source`)                   |
| Playground wrappers (real Volt)          | `apps/web/src/app/doqs/playgrounds/`                                        |
| Host blocks in Markdown (API tables, …)  | `apps/web/src/app/doqs/host/`                                               |

- **Routing.** `provideFileRouter(withExtraRoutes([DOQ_REGION_ROUTE]), withLocalizedRoutes())`. The region
  comes first because Etyma's localized tree ends in a catch-all. It matches `/docs/<page>` and
  `/<locale>/docs/<page>`, consumes nothing and loads `doq.routes.ts`; `doqRoutes()` there runs with
  `unmatched: 'continue'`, so a URL without a Markdown page finds no child and the router backtracks to the
  host's file routes. The bare `/docs` stays the host's redirect (now locale-preserving).
- **Bundle.** Doqs, the Markdown renderer, Prism, the examples and the playgrounds are in the lazy chunk.
  The home page and Theme Studio do not load them.
- **One shell, one `main`.** `landmark: 'host'` (`app.html` owns `<main>`). A migrated page renders the Doqs
  sidebar, outline and pager and no `app-docs-page-shell`; an unmigrated page renders the host shell only.
- **Language.** Etyma owns the URL prefix, `<html lang>`, canonical, `hreflang` and the header switcher;
  the adapter reports its locale (`ownsRouting`, `ownsHead`), and `withEtymaLocale()` puts Etyma's
  activation guard on every Doqs route. Doqs's own language selector is hidden. `fallback: 'none'`: a page
  missing in a locale is a 404 there, never English under a Spanish URL.
- **Head and SEO.** With `ownsHead`, Doqs writes no title or description; `lib/seo/seo.provider.ts`
  describes migrated pages from `seo-catalog.ts` exactly as before.
- **API tables.** `::demo[api-<name>]` renders the host's `ApiReference` from
  `lib/api-reference.generated.ts`, so host and Doqs pages share one generator
  (`scripts/generate-api-reference.mjs`, read from the public entry point). `doq-api` is not used: it would
  be a second, competing reference.
- **Prerendering.** `doqPrerenderRoutes(doqPaths)` without the bare index of each locale. The Cloudflare
  worker still answers every route (`_routes.json`); `pnpm check:ssr` renders all Doqs pages in it.

## Migration matrix

| Route (each in `/`, `/es`, `/uk`)                                                                | Status                             |
| ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `/docs/introduction`, `/docs/themes`, `/docs/customization`                                      | **MIGRATED**                       |
| `/docs/components/form-field`, `/input`, `/checkbox`, `/select`                                  | **MIGRATED**                       |
| `/docs` (redirect to the introduction)                                                           | HOST-OWNED                         |
| `/docs/components` (catalog)                                                                     | HOST-OWNED (gallery layout, stays) |
| `/docs/versioning`, `/roadmap`, `/migration-notes`, `/mcp`, `/ai-skill`, `/ai-mcp`, `/ai-prompt` | HOST-OWNED                         |
| The other 40 component pages (`/docs/components/<name>`)                                         | HOST-OWNED                         |
| —                                                                                                | BLOCKED: none                      |

MIGRATED means: Doqs serves the URL from Markdown in all three languages; demos and playgrounds work;
SSR in the Cloudflare worker, hydration, the SEO head and the browser journeys pass
(`e2e/doqs-docs.spec.ts`, `e2e/ssr-docs.spec.ts`, `pnpm check:ssr`, `pnpm check:seo`).

Known limits of the incremental state, by design until the last page moves: the Doqs sidebar lists only
Doqs pages (the host sidebars still list everything, migrated pages included), and Doqs search is off.

## Migrating the next page

1. Write `apps/web/src/authoring/docs/<path>.md` (frontmatter `title`, `description`, `group`, `order`)
   and its `docs-es` / `docs-uk` translations. Reuse the page's existing Glossa text; do not leave a
   language out (`fallback: 'none'` would 404 it, and `check:docs-completeness` fails a component page
   missing a locale).
2. Live content: put each example in `apps/web/src/app/doqs/examples/` (importing `@voltui/components`),
   register it in `doq.config.ts` and use `::demo[id]` plus `::source{file=… title=…}`. Interactive
   inputs: a wrapper in `playgrounds/` with controls named after the inputs. A component whose overlay
   mounts on `<body>` needs `expandedPreview: 'overlay-compatible'`. API tables: a component in
   `host/api-references.ts` and `::demo[api-<name>]`.
3. `pnpm docs:content`, then delete the host `.page.ts` (and its `.component.html`). The completeness check
   fails while both exist.
4. Verify: `pnpm check:docs-completeness`, `pnpm docs:content:check`, `pnpm vitest --run apps/web/src/app/doqs`,
   add the route to the lists in `e2e/doqs-docs.spec.ts`, `pnpm build && pnpm check:ssr && pnpm check:seo`,
   and the worker e2e (`E2E_SERVER=wrangler`).

`doq doctor --dir apps/web` reports one false failure in this monorepo: `@doqs/analog` is declared in the
root `package.json`, where every dependency lives.
