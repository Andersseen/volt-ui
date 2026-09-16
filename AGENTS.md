# AGENTS.md — Volt UI

## Project overview

Volt UI is an Angular component library inspired by shadcn/ui, built on top of [ng-primitives](https://ng-primitives.dev).

- **Monorepo layout**: Angular workspace with one app (`volt-ui`) and one library (`projects/volt` published as `@voltui/components`).
- **Docs app**: AnalogJS + file-based routing + Vite + Tailwind CSS v4.
- **CLI**: `cli/` contains a Node CLI for copying components into consumer projects (`@voltui/cli`).
- **Package manager**: pnpm (`packageManager: pnpm@10.30.1`).

## Tech stack

- Angular 21 (zoneless, standalone components, signals)
- AnalogJS 2.6 (docs app, SSR, file router)
- Vite 7 + `@tailwindcss/vite`
- Tailwind CSS v4 (CSS-only configuration, no `tailwind.config.js`)
- ng-primitives 0.110.2 (primitive behaviors / accessibility)
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
- The typed key contract (`src/app/i18n/etyma.generated.ts`) is generated at `vite dev`/
  `vite build` time by `@etyma/tooling`'s `etymaRemoteContract()` plugin, wired in
  `vite.config.ts`. It is committed (keys only, no translation values) so `pnpm typecheck`,
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
- `t()` is typed against the generated contract, so `t('nav.dcos')` does not compile.
- Static data — the component catalog, the blocks and layouts metadata, the sidebar — carries
  `TranslationKey` fields (`labelKey`, `descriptionKey`, …), never text. A `const` has no
  injector and so can never call `t()` itself.
- A sentence containing inline code, emphasis or a link stays **one** key and uses
  `<app-prose>`, which reads Markdown-style marks: `` `code` ``, `**bold**`,
  `[text](/docs/path)`. Splitting a sentence at its markup produces fragments no translator
  can reassemble.
- `src/app/i18n/__fixtures__/{en,es,uk}.json` is a **test-only** snapshot the unit test
  suite mocks `fetch` against (see `test-setup.ts`), so component specs that render real
  copy don't need a live Glossa connection. It is never imported by production code and can
  drift from Glossa between refreshes — it is not a source of truth for content.

Do not recreate any of this: no `scripts/glossa/`, no `GlossaClient`/`GlossaService`, no
local sync state. Glossa owns catalog storage and parity across locales; Volt only owns the
config that connects to it.

Two kinds of text are deliberately **not** translated:

| Not translated                            | Why                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/blocks/**`, `src/app/layouts/**` | Read with `?raw` and shown as source to copy. A `t()` call would break in a consumer's project, which has no `Translations`.          |
| The live demo inside `<app-code-panel>`   | It is an exhibit of the code shown beside it. A demo reading "Manzana" next to a snippet saying `Apple` looks broken, not translated. |

The guard recognises both structurally; the handful of specimens that sit outside a code
panel are listed with their reasons at the top of `no-hardcoded-copy.spec.ts`.

## Adding or editing a component

1. Create/edit files under `projects/volt/src/lib/components/<name>/`.
2. Update `projects/volt/src/public-api.ts` if it is a new public export.
3. Add/update the demo page under `src/app/pages/(components-docs)/docs/components/<name>.page.ts`.
4. Add/update source-code snippet exports in `src/app/lib/snippets/index.ts` and `src/app/lib/snippets/usage.ts`.
5. Add real unit tests using `@testing-library/angular` or `TestBed` (not just string checks).
6. Run `pnpm typecheck`, `pnpm lint`, `pnpm test:run`, and `pnpm build:lib`.
7. Regenerate the CLI manifest with `pnpm manifest` when component files change.

## Important notes

- The manifest for the CLI is generated by `cli/generate-manifest.js` and written to `public/manifest.json`.
- The CLI copies component files from the local `projects/volt/src/lib` source; inter-component dependencies are detected automatically from source imports.
- Do not commit the `dist/` folder.

## AI tools for consumers

The repo provides three complementary ways to give AI assistants context about Volt UI. None of these are auto-discovered by a consumer project on their own — they must be installed via `npx volt-ui-mcp <agent>` (or copied manually):

1. **Skill** — `.agents/skills/volt-ui/SKILL.md` is the source of truth for the skill content. `npx volt-ui-mcp claude` installs an inlined copy (`VOLT_UI_SKILL` in `cli/mcp/setup-mcp.js`) into the consumer's `.claude/skills/volt-ui/SKILL.md`, where Claude Code auto-discovers it. For OpenCode, copy the same file to `.agents/skills/volt-ui/SKILL.md` in the consumer project.
2. **MCP server** — `src/server/routes/mcp.ts` is a spec-compliant Streamable HTTP MCP server (tools: `list_components`, `get_component`, `get_usage_example`, `get_theme_info`, `get_project_info`, `generate_cli_command`; resources: `component://<name>`, `theme://info`, `project://info`; prompts: `generate-volt-ui-component`, `volt-ui-troubleshooting`). Production endpoint: `https://volt-ui.pages.dev/api/mcp`. `npx volt-ui-mcp claude` writes it to `.mcp.json` at the consumer's repo root (Claude Code's project-level MCP config, `"type": "http"`); `cursor`/`windsurf` targets write their own client-specific config. Claude Desktop does not support remote MCP servers via `claude_desktop_config.json` — add them through Settings → Connectors instead.
3. **Prompt reference** — `VOLT_UI_PROMPT.md` is a single-file prompt that can be pasted into any LLM chat to get correct selectors, examples, and rules for Volt UI components.

The single installer script lives at `cli/mcp/setup-mcp.js` (published as `volt-ui-mcp`; the root `package.json` bin/`setup:mcp` script point there too — don't recreate a second copy).

When updating component APIs, selectors, or examples, keep all of these in sync (run `pnpm check:ai-docs` to catch component list drift automatically):

- `.agents/skills/volt-ui/SKILL.md`
- `cli/mcp/setup-mcp.js` (`VOLT_UI_SKILL`, `CURSOR_RULES`, `COPILOT_INSTRUCTIONS`, `VSCODE_SNIPPETS`)
- `src/server/routes/mcp.ts` and `src/server/routes/mcp/setup.ts` (same constants, mirrored for the hosted `/api/mcp/setup` endpoint)
- `VOLT_UI_PROMPT.md`
- `src/app/lib/snippets/usage.ts`
