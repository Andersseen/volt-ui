# AGENTS.md — Volt UI

## Project overview

Volt UI is an Angular component library inspired by shadcn/ui, built on top of [ng-primitives](https://ng-primitives.dev).

- **Monorepo layout**: Angular workspace with two apps — Volt UI docs (`volt-ui`, `src/`, voltui.dev) and Volt UI Recipes (`apps/recipes/`, recipes.voltui.dev) — plus `shared/` and one library (`projects/volt` published as `@voltui/components`).
- **Docs app**: AnalogJS + file-based routing + Vite + Tailwind CSS v4.
- **CLI**: `cli/` contains a Node CLI for copying components into consumer projects (`@voltui/cli`).
- **Package manager**: pnpm (`packageManager: pnpm@10.30.1`).

## Tech stack

- Angular 22 in the workspace (zoneless, standalone components, signals); the package supports 21.2+ and 22 — `pnpm check:angular-compat <major>` proves each against the packed tarball
- AnalogJS 2.6 (docs app, SSR, file router)
- Vite 7 + `@tailwindcss/vite`
- Tailwind CSS v4 (CSS-only configuration, no `tailwind.config.js`)
- ng-primitives (primitive behaviors / accessibility; pinned in `package.json`, peer range in `projects/volt/package.json`)
- class-variance-authority (CVA) for component variants
- Vitest + `@testing-library/angular` + Playwright

## Key commands

```bash
# Install dependencies
pnpm install

# Dev server for docs
pnpm dev

# Build docs app
pnpm build

# Build Angular library
pnpm build:lib

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Unit tests
pnpm test:run

# Full CI pipeline
pnpm test:all
```

## Code conventions

- Use **standalone components**; no NgModules.
- Use **OnPush** change detection everywhere.
- Prefer **signals**: `input()`, `output()`, `model()`, `computed()`.
- Boolean inputs must use `booleanAttribute`:
  ```ts
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  ```
- Number inputs should use `numberAttribute` when appropriate.
- Component variants should use **class-variance-authority** (see `button.ts`, `badge.ts`, `toggle.ts`).
- Library components live in `projects/volt/src/lib/components/<name>/` with a barrel `index.ts`.
- Export every public component from `projects/volt/src/public-api.ts`.
- The docs app imports the library via the `volt` alias (mapped to `projects/volt/src/public-api.ts`).

## Two applications

|                       | Volt UI (docs)                                          | Volt UI Recipes                                                                                   |
| --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Origin                | https://voltui.dev                                      | https://recipes.voltui.dev                                                                        |
| Root                  | `src/` (`vite.config.ts`)                               | `apps/recipes/` (`apps/recipes/vite.config.ts`)                                                   |
| Owns                  | component docs, API, theming, Theme Studio, AI/MCP docs | copyable **blocks**, **layouts**, **recipes** (live preview, source, install, related components) |
| Dev / build / preview | `pnpm dev` / `build` / `preview`                        | `pnpm dev:recipes` / `build:recipes` / `preview:recipes`                                          |
| Typecheck / e2e       | `pnpm typecheck` / `pnpm test:e2e`                      | `pnpm typecheck:recipes` / `pnpm test:e2e:recipes`                                                |
| Output                | `dist/analog/public`                                    | `dist/apps/recipes/analog/public`                                                                 |
| Cloudflare Pages      | `volt-ui`                                               | `volt-ui-recipes`                                                                                 |

`shared/` holds only what both need and is imported as `@shared/*`: i18n (one Glossa project, one generated contract), theme presets and `styles/site.css` (the token imports), the code panel, copy button, theme/language switchers, SEO service and URL helpers. Neither app imports the other's private directories; the one sanctioned bridge is `shared/legacy-redirects.ts`, built from the Recipes catalog.

Recipes shows what you can **build**; it never re-documents a component's API (that is voltui.dev, linked with absolute URLs). Blocks, layouts and recipes stay copyable source, never `@voltui/components` exports. To add one, see `docs/recipes-app.md`; to deploy, same file. Old `/docs/{blocks,layouts,recipes}/*` URLs 301 to Recipes (`shared/legacy-redirects.ts`).

## Docs site rules

These apply to everything under `src/app/` (the official site), not to the library itself.

- **The site is built from Volt UI atoms only.** Every UI brick — button, link-as-button,
  card, panel, badge, chip, input, toggle, tabs, progress, separator — is a Volt component
  (`volt-button`, `a[voltButton]`, `volt-card`, `volt-badge`, `volt-toggle-group`, …). Never
  hand-style a `<button>`, an `<a class="inline-flex … rounded-md">` or a bordered `<div>` card
  in a page. Layout (grid, flex, spacing), typography and purely decorative marks (a swatch, a
  divider line) are fine. If an atom is missing or cannot express what the site needs, fix or
  extend the library first (its own ripple effects apply) — the site is Volt's showcase, and a
  custom brick there hides exactly the gap a consumer would hit.
- **Small components, single responsibility.** One component does one job. Split a section into
  an orchestrator that owns state, effects and layout, and presentational children that take
  `input()`s and emit `output()`s; keep static data (steps, items, code samples) in its own file.
  If a template grows past roughly 80 lines, or a file mixes state, browser observers and markup
  for several pieces, split it. Group a section's parts in one folder (see
  `src/app/components/landing/{pillars,playground,steps}/`).

### Volt-first for voltui.dev itself

> If Volt UI already provides an atom or interaction primitive for the responsibility, voltui.dev
> uses the Volt public API instead of rebuilding that responsibility with raw Tailwind or by
> importing `ng-primitives` directly.

- **Before writing site UI, search the catalog** (the `volt-ui` MCP, `list_components`, or
  `src/app/lib/component-metadata.ts`) for an existing responsibility. Hand-written equivalent UI
  needs an explicit reason. This does not apply to `projects/volt/src/lib/**` — the library cannot
  implement Button using Button.
- **Prefer Volt responsibility, not Volt tag count.** Native HTML stays correct where Volt has no
  equivalent, or the native element is the point: a route-backed tab strip is a set of real
  anchors because the router owns selection (middle-click, SSR deep links). Don't force a stateful
  `volt-tabs` over the Router.
- **`pnpm check:dogfood`** enforces the mechanical part in CI: no `ng-primitives` imports under
  `src/app`, no `<button>` without a Volt directive, no button-like anchors or hand-styled card
  tiles. It skips `blocks/`, `layouts/` and `lib/snippets/` (source the site displays for
  consumers to copy) and the live demo in a code panel. An exception goes in `EXCEPTIONS` in
  `scripts/check-dogfood.mjs`, naming the file, the tag and the reason.
- **`specs/dogfood-inventory.md`** (`pnpm generate:dogfood`) lists, per atom, whether the real
  application uses it or only a demo page does. Real use is stronger evidence than a Storybook
  story; it is not a reason to put an atom on the site the site has no use for.
- **When Volt can't express what the site needs, that is dogfood evidence.** Reproduce it, decide
  whether the site misuses the atom, and if the public API genuinely falls short add a failing
  library test and the smallest backwards-compatible fix (plus a Storybook state if relevant)
  rather than working around it with raw Tailwind.
- **Reviewing any PR that touches `src/app/**`**: did we reuse an existing atom? did we bypass Volt
  with ng-primitives? did we duplicate Volt styling? is the raw native HTML intentional? does the
  site expose a missing Volt API that belongs upstream?

## Theme system

- Theme tokens are CSS custom properties in `projects/volt/src/themes/core.css`.
- Avoid recursive CSS variables; theme-source variables use the `--volt-*` prefix (e.g. `--volt-shadow-sm`).
- Tailwind `@theme inline` maps to those source variables (e.g. `--shadow-sm: var(--volt-shadow-sm);`).
- Components should use Tailwind utilities (`bg-primary`, `rounded-md`, `shadow-lg`) instead of `bg-[var(--primary)]` or `shadow-[var(--shadow-lg)]`.
- Color presets: `volt`, `ember`, `sage`, `dusk`, `glacier`.
- Style presets: `sharp`, `soft`, `brutal`, `ghost`, `retro`.

## Site copy and translations

The docs site is published in English, Spanish and Ukrainian. **Every string a visitor
reads is reached through `t()`** — there is no second convention, and
`src/app/i18n/no-hardcoded-copy.spec.ts` fails the build if one appears.

Translation content is managed by **Glossa**, not this repo:

- Runtime catalogs are fetched from `https://glossa.andersseen.dev/i18n/volt-ui` — see
  `src/app/i18n/i18n.ts` (`defineRemoteI18n` + `createHttpMessageLoader`). Volt UI does not
  store production translation content locally, and does not have a sync script, client, or
  cache for it — `@etyma/core`'s HTTP loader talks to Glossa's public delivery endpoint
  directly.
- The typed message contract (`src/app/i18n/etyma.generated.ts`) is generated at `vite dev`/
  `vite build` time by `@etyma/tooling`'s `etymaRemoteContract()` plugin, wired in
  `vite.config.ts`. It carries the exact keys, the `{$variables}` each source message takes,
  and the raw MF2 functions they reach (`{$year :number}`) — never translation values. It is
  committed so `pnpm typecheck`,
  the editor's TS server, and a build during a Glossa outage all still have a last-known
  contract. **Do not hand-edit it.** After a source-locale key is added or removed through
  Glossa, restart `pnpm dev` or run `pnpm build` so Etyma refreshes it — there is no watcher
  for this.
- For translation changes (adding, editing, or reading a key), use the **`glossa`** MCP
  server (`.mcp.json`) — tools include `get_project`, `list_catalogs`, `get_translation`,
  `set_translation`. It needs `GLOSSA_TOKEN` exported in the shell that starts your agent
  (see `.env.example`); the token is a developer/agent secret, never committed, never bundled
  into the site, and not required for the site itself to build or run. Read a translation
  before overwriting it — Glossa has revision/concurrency protection.
- `t()` is typed against the generated contract, so `t('nav.dcos')` does not compile, nor do
  `t('language.current')` without `{ name }` or `t('footer.rights', { year: new Date() })`.
  `pnpm typecheck` runs `ngc` as well as `tsc` so this reaches template calls too; `tsc`
  alone never reads a template. `src/app/i18n/i18n.typecheck.ts` keeps those guarantees
  from silently eroding — don't annotate `injectAppI18n()`'s return type, which would erase
  the per-key params.
- Static data — the component catalog, the blocks and layouts metadata, the sidebar — carries
  `PlainTranslationKey` fields (`labelKey`, `descriptionKey`, …), never text: keys whose
  message has no variables, so `t(item.labelKey)` is always callable. A `const` has no
  injector and so can never call `t()` itself.
- A sentence containing inline code, emphasis or a link stays **one** key and uses
  `<app-prose>`, which reads Markdown-style marks: `` `code` ``, `**bold**`,
  `[text](/docs/path)`. Splitting a sentence at its markup produces fragments no translator
  can reassemble. A message with variables is translated by the caller, which checks its
  params: `<app-prose [text]="t('guide.mcpPage.mcpBody', { url })" />`.
- `src/app/i18n/__fixtures__/{en,es,uk}.json` is a **test-only** snapshot the unit test
  suite mocks `fetch` against (see `test-setup.ts`), so component specs that render real
  copy don't need a live Glossa connection. It is never imported by production code and can
  drift from Glossa between refreshes — it is not a source of truth for content.

Do not recreate any of this: no `scripts/glossa/`, no `GlossaClient`/`GlossaService`, no
local sync state. Glossa owns catalog storage and parity across locales; Volt only owns the
config that connects to it.

Two kinds of text are deliberately **not** translated:

| Not translated                                     | Why                                                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/recipes/src/app/{blocks,layouts,recipes}/**` | Read with `?raw` and shown as source to copy. A `t()` call would break in a consumer's project, which has no `Translations`.          |
| The live demo inside `<app-code-panel>`            | It is an exhibit of the code shown beside it. A demo reading "Manzana" next to a snippet saying `Apple` looks broken, not translated. |

The guard recognises both structurally; the handful of specimens that sit outside a code
panel are listed with their reasons at the top of `no-hardcoded-copy.spec.ts`.

## Testing

> Coverage is a side effect of meaningful tests, not their purpose.

A component is verified when its public consumer contract is observed through the DOM and, where
browser behaviour matters, in a real browser — see [`specs/TESTING.md`](specs/TESTING.md) (the
contracts, the Stateful Value Contract, the layers) and [`specs/state-ownership.md`](specs/state-ownership.md)
(who owns each value; why `mirrorValue()` is applied where it is). `specs/behavioral-contracts.md` is the
generated map of which test proves which contract (`pnpm generate:behavior-matrix`).

- Component specs: Vitest + `@testing-library/angular` + `userEvent`, zoneless, queries by role / label,
  assertions on `aria-*`, `data-*`, the native value. Not on signals or implementation classes.
- Anything a browser must prove (focus, keyboard, pointer geometry, portals, drag and drop, computed
  styles) goes in `e2e/contracts` (`pnpm test:e2e:contracts`), run against the built package in
  Chromium, Firefox and WebKit.
- A bug fix reproduces the bug in a failing test first. Ask whether it corresponds to a public state
  story (Pressed, Disabled, Invalid, Loading, Empty) and add it to Storybook and to `REQUIRED_STATES`
  in `scripts/check-storybook.mjs` if so.

## Adding or editing a component

1. Create/edit files under `projects/volt/src/lib/components/<name>/`.
2. Update `projects/volt/src/public-api.ts` if it is a new public export.
3. Add/update the demo page under `src/app/pages/(components-docs)/docs/components/<name>.page.ts`.
4. Add/update source-code snippet exports in `src/app/lib/snippets/index.ts` and `src/app/lib/snippets/usage.ts`.
5. Add real unit tests using `@testing-library/angular` or `TestBed` (not just string checks).
6. Run `pnpm typecheck`, `pnpm lint`, `pnpm test:run`, and `pnpm build:lib`.
7. Regenerate the CLI manifest with `pnpm manifest` when component files change.
8. Add `stories/components/<name>.stories.ts` and an entry in `stories/_docs/component-guides.mjs` (with `COMPONENT_RELATIONS` if it is routinely confused with another), then `pnpm generate:storybook-docs` and `pnpm generate:agent-skills` (see "Storybook" and "AI tools for consumers").

## Search and discovery (SEO)

The site's search metadata is written during server rendering from one catalog, so a page cannot be in the sitemap and missing from the head (or the other way round).

- `src/app/lib/seo/site.ts` — `SITE_ORIGIN` (`https://voltui.dev`, the only production origin), the social image and locale-aware path helpers. `seo.spec.ts` fails if the previous origin reappears anywhere in the repository.
- `src/app/lib/seo/seo-catalog.ts` — every indexable route and where its title/description comes from. Components, blocks, layouts and recipes are derived from their catalogs; only guide pages are listed by hand. A new component gets metadata with no extra step.
- `src/app/lib/seo/seo.provider.ts` + `seo.service.ts` — after each navigation, write title, description, Open Graph, Twitter and JSON-LD for the page and language on screen. **`@etyma/analog` owns `<html lang>`, the canonical link and `hreflang`**: never add a second writer.
- Titles and descriptions are Glossa keys (`seo.*`; patterns such as `seo.component.title` take `{$name}`). Add them with the Glossa MCP, one key across all three locales back to back (builds validate the live catalogs), then refresh the contract with `pnpm dev`/`pnpm build`.
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` are generated by `pnpm generate:seo-files` (covered by `pnpm check:generated`). `llms.txt` is a convention for tools, not a ranking signal; search visibility only needs the site to stay crawlable, so keep `robots.txt` permissive (OAI-SearchBot included).
- `pnpm check:seo` fetches representative pages from the built worker (or `--url` a running server) and checks the raw HTML: one title, description, canonical and hreflang set, Open Graph/Twitter, valid JSON-LD, `lang`, the 404 behaviour and the crawler files. CI runs it in the SSR job.
- A path no route claims gets a `noindex, follow` robots tag when the router raises NG04002 (the Cloudflare worker answers 200 for the empty shell whatever status the render sets, so the tag is the signal). A catch-all file route is deliberately not used: it breaks Etyma's localized redirects (`/es/docs` → `/es/docs/introduction`).
- `public/og.png` (1200×630) is rendered by `node scripts/generate-og-image.mjs`; re-run it only if the card changes.

## Storybook

Storybook (`@storybook/angular-vite`, Storybook 10) is the component **reference**: every public component, its states, accessibility notes and API, rendered from the real library. voltui.dev stays the main documentation site (guides, blocks, recipes, theme builder, localisation); Storybook complements it and is English-only.

```bash
pnpm storybook         # dev server on http://localhost:6006 (regenerates the docs pages first)
pnpm build:storybook   # static build in dist/storybook (ignored by git)
pnpm check:storybook   # every public component has a correctly titled stories file
pnpm test:storybook    # Playwright smoke tests against dist/storybook (build first)
```

- Config lives in `.storybook/` (`main.ts`, `preview.ts`, `manager.ts`) with its own `.storybook/vite.config.ts`: it never loads the docs app's `vite.config.ts`, so a Storybook build does not touch Glossa or the network. Targets are `volt:storybook` / `volt:build-storybook` in `angular.json`; `tsconfig.storybook.json` type-checks stories (`pnpm typecheck:storybook`).
- Stories import from `volt` (the public surface), never from `projects/volt/src/lib`. Styles come from `src/styles.css`, which imports the real theme sources, so there is no Storybook theme. The toolbar's colour/style/appearance switches call `applyVoltTheme`.
- **Documentation pages are generated.** `stories/components/<name>.mdx` is written by `scripts/generate-storybook-docs.mjs` from the existing sources: `api-reference.generated.ts` (API tables), `snippets/usage.ts` (full example), `component-metadata.ts` (group), `COMPONENT_STATUS.md` (status, keyboard, focus, forms) and the prose in `stories/_docs/component-guides.mjs`. Never hand-edit the `.mdx`; `pnpm check:generated` fails on drift. Foundations pages in `stories/foundations/` are hand-written.
- Story titles are literal `Components/<Group>/<Title>` (the group and title come from the guide entry); `pnpm check:storybook` enforces it and fails when a public component has no stories.
- `args`/`argTypes`: use the signal inputs as they are. Take variant options from the generated API with `variantArgTypes()` (`stories/_helpers/api.ts`), not a second hand-typed list.
- The smoke test (`e2e/storybook/`) renders **every** story and fails on a runtime error, so a broken story breaks CI.
- Deployment: CI builds Storybook in the `storybook` job. The `deploy-storybook` job publishes `dist/storybook` to the Cloudflare Pages project `volt-ui-storybook` (custom domain `storybook.voltui.dev`) and only runs when the repository variable `STORYBOOK_DEPLOY` is `true`.

## Important notes

- The manifest for the CLI is generated by `cli/generate-manifest.js` and written to `public/manifest.json`.
- The CLI copies component files from the local `projects/volt/src/lib` source; inter-component dependencies are detected automatically from source imports.
- Do not commit the `dist/` folder.

## AI tools for consumers

The architecture is one rule: **the MCP server tells agents what Volt contains; the skills teach them
when and how to use it.** Nothing is copied from one to the other.

1. **MCP server** (`src/server/routes/mcp.ts`, Streamable HTTP, `https://voltui.dev/api/mcp`) — the
   factual source: `list_components`, `find_components` (by intent, with `useWhen`/`notFor`/
   `related`), `get_component`, `get_usage_example` (both take `mode: package | copy`),
   `get_theme_info`, `get_project_info`, `generate_cli_command`; resources `component://<name>`,
   `theme://info`, `project://info`; prompts `generate-volt-ui-component`, `volt-ui-troubleshooting`.
   Responsibility metadata and the supported Angular range are **generated**
   (`src/server/routes/mcp/responsibilities.generated.ts`), never hand-written there.
2. **Skills** (`cli/agent/skills/<name>/SKILL.md`, the only copy) — short, single-responsibility
   playbooks: `volt-ui` (router), `volt-ui-adoption`, `volt-ui-component-selection`, `volt-ui-forms`,
   `volt-ui-overlays`, `volt-ui-styling`, `volt-ui-distribution`. They do not carry a component API.
   Each ends with a `volt:digest` section: that is all a rules-file agent (Cursor, Windsurf, Copilot,
   Gemini CLI) receives. Add a skill only for a genuinely independent workflow; the expected set is in
   `cli/check-ai-docs-sync.js`.
3. **Installer** (`cli/agent/`, `@voltui/agent`) — `npx @voltui/agent <agent>` writes the MCP entry
   and, per agent, the skills (Claude Code `.claude/skills/`, Codex and OpenCode `.agents/skills/`) or
   a routing block (`.cursorrules`, `.windsurfrules`, `copilot-instructions.md`, `GEMINI.md`).
   `content.js` holds only executable generation (the block, the snippets); `skills.js` reads the
   skill files.
4. **Prompt reference** — `VOLT_UI_PROMPT.md`, a single file to paste into a chat LLM with no MCP.
   Its component catalog is generated from the library source.

Generated pieces — never hand-edit, `pnpm check:generated` fails on drift:

- `pnpm generate:agent-skills` → the catalog in `volt-ui-component-selection`, the catalog in
  `VOLT_UI_PROMPT.md`, `mcp/responsibilities.generated.ts`, and the `.agents/skills/volt-ui*` copies
  (for agents working in this repo).
- `pnpm generate:mcp-content` → `mcp/content.generated.ts`, the hosted `/api/mcp/setup` payload.

Responsibility data (what a component is for, where it stops) comes from one place:
`stories/_docs/component-guides.mjs` (`COMPONENT_GUIDES` + `COMPONENT_RELATIONS`) and
`COMPONENT_STATUS.md`. Edit those, not the AI files.

`pnpm check:ai-docs` compares everything an AI tool reads with the library itself — the selectors it
declares, what it exports, its peer dependencies, `COMPONENT_STATUS.md` — and fails on an unknown
element or directive, an import that does not exist, a `Ui*` name used for the package, a component
called `beta` that is `stable`, a hard-coded Angular major, a skill set that is not the expected one,
or a skill that grew past its budget.

## Agentyx harness

[Agentyx](https://www.npmjs.com/package/@agentyx/cli) (`@agentyx/cli`, dev dependency) installs generic engineering skills into
`.agents/skills/` (Codex, Kimi) and `.claude/skills/` (Claude Code), plus `context7`, `playwright` and `codebase-memory` MCP entries and a
`SessionStart` doctor hook. Configuration is `.agentyx.json`; ownership is `.agentyx.lock.json`. It manages the _coding-agent harness_ only.

- It **complements** the repo-specific tooling above (`/new-component`, `/run-plan`, the reviewers, the ripple-check and ai-docs-gate hooks,
  `specs/`). Where they overlap, this file and `specs/GUARDRAILS.md` win.
- It is unrelated to Volt's product MCP (`src/server/routes/mcp.ts`, `cli/agent/`) and to `pnpm check:ai-docs`. Never route Volt's AI docs through it.
- `chrome-devtools` stays **disabled** in the Agentyx config. Use the `.mcp.json` entry only for tasks that need browser inspection (perf traces).
- `agentyx install` rewrites the `playwright` and `codebase-memory` entries in `.mcp.json`, `.codex/config.toml` and `.kimi-code/mcp.json`
  (dropping `--browser chromium`, and pointing at a global `codebase-memory-mcp` binary instead of `npx`). The committed versions are
  deliberately the repo's originals, so do not blindly re-run `agentyx install`: use `--dry-run` and restore those two entries afterwards.
