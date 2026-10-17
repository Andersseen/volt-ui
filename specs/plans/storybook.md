# Plan — Storybook component reference

**Status:** implemented on `feat/storybook-reference-docs`; awaiting review. Not a version bump: no library or CLI change, nothing is published.
**Scope:** `.storybook/`, `stories/`, scripts, CI, docs. Library code (`projects/volt/`) and the docs site (`src/app/`) are untouched.

## Why

voltui.dev is the product site. Contributors and consumers also need an isolated, interactive component reference: every public component with its states, a theme/viewport playground, accessibility tooling and an accurate API, readable as documentation. Storybook provides that; it must not become a second source of truth.

## New dependencies (GUARDRAILS rule 10)

All `devDependencies`, pinned to the same exact version (Storybook ships as a lockstep set):

| Package                   | Why                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook` 10.6.2        | The core (manager, preview, CLI, controls, actions, viewport, toolbars).                                                                      |
| `@storybook/angular-vite` | The Angular framework on Vite. Chosen over webpack `@storybook/angular`: the repo is Vite + Tailwind v4 + zoneless, and it needs no Compodoc. |
| `@storybook/addon-docs`   | MDX and docs pages (the generated component pages and the Foundations pages).                                                                 |
| `@storybook/addon-a11y`   | The official axe-core panel on every story.                                                                                                   |

Checked: Storybook 10.6.2 supports Angular `>=21 <23` (the repo is on 22.2), Vite `>=8`, and `@analogjs/vite-plugin-angular >=2.7.3` (repo: 2.8). No Compodoc, no `zone.js`, no `remark-gfm` (API tables are emitted as HTML), no Chromatic.

## Decisions

1. **Isolated Vite config.** `.storybook/vite.config.ts` replaces the root one. The root `vite.config.ts` runs the Etyma plugin, which validates Glossa catalogs over the network: a Storybook build must not depend on that.
2. **One theme implementation.** `.storybook/preview.ts` imports `src/styles.css` (which imports `projects/volt/src/themes/**`) and the toolbar calls the library's own `applyVoltTheme`.
3. **Generated docs pages.** `scripts/generate-storybook-docs.mjs` writes `stories/components/<name>.mdx` from `api-reference.generated.ts`, `snippets/usage.ts`, `component-metadata.ts`, `COMPONENT_STATUS.md` and one prose file, `stories/_docs/component-guides.mjs`. It is part of `pnpm check:generated`. The only new hand-written prose per component is the summary, "when to use" and accessibility notes.
4. **Variants from the API reference.** `variantArgTypes()` reads CVA options from the generated API so controls cannot drift.
5. **Guard.** `pnpm check:storybook` fails when a public component has no stories file, the wrong title, no story export, or imports library internals.
6. **Smoke.** `e2e/storybook/storybook.spec.ts` (its own Playwright config) serves `dist/storybook` and renders every story, failing on any runtime error, plus named checks for Introduction, Button docs, Input, Dialog, Select, Toast and theme switching.

## Out of scope

Localised Storybook, visual regression/Chromatic, new components, public API changes, publishing.

## Deployment

CI job `storybook` builds and smoke-tests on every PR. Job `deploy-storybook` publishes `dist/storybook` to the Cloudflare Pages project `volt-ui-storybook`, and runs only when the repository variable `STORYBOOK_DEPLOY` is `true`.

Manual steps after merge (external, not done from the repo):

1. Cloudflare dashboard → Workers & Pages → Create → Pages → _Direct upload_ → project name `volt-ui-storybook` (production branch `main`).
2. Project → Custom domains → add `storybook.voltui.dev`.
3. GitHub → Settings → Secrets and variables → Actions → Variables → add `STORYBOOK_DEPLOY` = `true` (the existing `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are reused; the token needs Pages edit access for the account).
4. Re-run the `main` CI (or push any commit). Once https://storybook.voltui.dev loads, add a link to it from the README and the docs site.

## Open questions

- Compodoc-free docgen (`experimentalDocgenServer`) is marked experimental by Storybook until Storybook 11. The API section on each page does not depend on it (it comes from the repo's own generator); only the Controls table does.
- The generated API reference shows `unknown` for inputs re-exposed through `hostDirectives` (for example `VoltDialogContent.role`). That is an existing limitation of `scripts/lib/api-extract.mjs`, not changed here.
