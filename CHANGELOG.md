# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2026-08-02

### Added

- Added `scripts/contrast-audit.mjs`: computes real WCAG contrast ratios (oklch -> linear
  sRGB -> relative luminance) for every semantic color pair across all 5 color presets x
  light/dark. `pnpm check:contrast` runs it; wired as a repeatable check, not a one-off.
- Added `scripts/docs-completeness-check.mjs` (`pnpm check:docs-completeness`): compares
  `public-api.ts` exports against source snippets, usage snippets, and demo pages.
- Added `scripts/generate-api-reference.mjs` (`pnpm generate:api-reference`): generates
  `src/app/lib/api-reference.generated.ts` from the actual component source (inputs,
  outputs, CVA variants) instead of hand-written tables that would drift.
- Added an **API Reference** section (inputs/outputs/variants) to every component demo
  page and the sidebar layout page, rendered by a new shared `<app-api-reference>`
  component.
- Added `/docs/customization`: editing a copied component, extending CVA variants,
  overriding classes with `cn()`, and when to reach for a theme preset instead.
- Added `/docs/migration-notes`: 0.x changes that actually require touching template
  code, sourced from this changelog.
- Added a Runtime API section, a Dark Mode Strategy section, and copy-paste templates
  for custom color and style presets to `/docs/themes`.
- Added `e2e/theme-presets.spec.ts`: drives the real header color/style pickers and
  dark-mode toggle on a live page and asserts computed tokens change.

### Fixed

- **Contrast**: fixed 67 color pairs across every preset that failed WCAG AA — buttons
  and status surfaces as low as 2.4:1 against their foreground text, and every preset's
  form-field border (`--input`) at ~1.1-1.4:1 against the page background (SC 1.4.11).
  Every fix is a hue/chroma-preserving lightness adjustment; brand identity is
  unchanged. All 130 checks (5 colors x light/dark x 13 pairs) now pass.
- **Theme drift**: `src/styles.css` carried a ~370-line hand-duplicated fork of every
  color and style preset, completely disconnected from
  `projects/volt/src/themes/` — the actual root cause of why the contrast bugs were
  invisible in the deployed docs site even after a library-side fix. Replaced it with
  `@import` of the same source files `@voltui/components/themes.css` ships.
- **SSR theme flash**: `provideVoltTheme()` read the global `document`, which is
  undefined during SSR, so its environment initializer silently no-op'd on the server.
  SSR consumers got default-theme HTML that flashed to their configured theme on
  hydration. Fixed by reading Angular's `DOCUMENT` injection token instead.
- **Docs-app theme flash**: the docs app's own saved theme (localStorage) was only
  applied from a component constructor, well after first paint. Added a synchronous
  inline script in `index.html`'s `<head>`, before any stylesheet, that applies it
  before the browser paints anything.
- Fixed the dialog demo page, which rendered raw `ng-primitives/dialog` directives with
  hand-duplicated Tailwind classes instead of the real `VoltDialog*` components, and
  showed a fabricated "Component Source" stub missing the real host classes entirely
  (no backdrop styling, no animation classes). Rewritten to use the real components,
  mirroring the (correct) drawer demo.
  - Added `DIALOG_SNIPPET`, `SIDEBAR_SNIPPET`/`SIDEBAR_USAGE`.
  - Moved `search`/`autofill`'s existing inline usage examples into the shared
    `snippets/usage.ts` convention every other component follows.
- Fixed the sidebar layout page's "Installation" section, which was an unfinished
  placeholder in Spanish pointing at a source path that doesn't exist
  (`src/app/layout/sidebar/`); replaced with proper Usage/Component Source panels.
- Fixed README.md's component count (said 40 in three places; the catalog table below
  it, and `public-api.ts`, both say 41).
- Fixed `scripts/generate-api-reference.mjs` truncating function-typed inputs
  (combobox's `compareWith`, `scrollToOption`, `itemLabel`, `trackByFn`) at nested
  commas and `=>` arrows in their type signatures.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.8.0`.
- Removed `test_tooltip.js`, `test_playwright.js`, `update.js` from the repo root
  (unrunnable/dead one-off scripts from early scaffolding).
- Moved `ANALOGJS_USAGE.md` and `ANGULAR_USAGE.md` into `docs/`.
- Dropped `@analogjs/content` and `front-matter` as direct dependencies — both are
  already transitive dependencies of `@analogjs/router`/`@analogjs/platform` and
  nothing imports them directly.

## [0.7.0] - 2026-07-29

### Added

- Added full-source coverage enforcement with ratcheted thresholds and made coverage part
  of CI and the release gate.
- Added behavior tests for date-picker, file-upload, listbox, navigation-menu, resizable,
  table and sidebar; the suite now covers every component family in the v1 surface.
- Added Reactive Forms support to listbox and input-OTP while retaining their existing
  model-binding APIs.
- Added Reactive Forms, disabled, touched, filtering and selection coverage for combobox.
- Added keyboard resizing and ARIA value semantics to resizable separators.
- Added security, contribution, pull-request, issue and dependency-update policies.

### Changed

- Fixed the v1 component surface: all 40 components are now either stable or beta, with no
  experimental entries remaining.
- Updated usage snippets to recommend Reactive Forms for combobox, date-picker, input-OTP
  and listbox.
- CI and automated releases now verify AI-doc synchronization, coverage, all publishable
  tarballs, docs E2E and the packaged consumer fixture before publishing.
- Added complete npm metadata for the components, CLI and MCP installer packages.
- Bumped the root package, `@voltui/components` and `@voltui/cli` to `0.7.0`.

### Fixed

- Added ARIA table, row-group, row, header and cell semantics to custom table elements.
- Propagated native and ARIA disabled state through file-upload, listbox and input-OTP.
- Corrected stale stability metadata in the docs application.
- Replaced outdated testing and contributing instructions with the current repository
  paths and quality gates.

## [0.6.0] - 2026-07-04

### Added

- Added shared Playwright overlay helpers for visible layout, Escape dismissal, outside-click dismissal, focus return, and focus trap checks.
- Expanded consumer e2e overlay coverage for popover outside click, dropdown keyboard navigation, tooltip hover/focus, dialog/drawer focus trap and focus return, nested overlays, and toast dismissal.
- Added overlay unit coverage for drawer, dropdown menu, popover, toast, and tooltip primitives.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.6.0`.
- Updated docs/demo select usage to prefer `[(value)]` model binding for `volt-select`.
- Updated `volt-dropdown-menu-item` to attach `NgpMenuItem` on the host so roving focus can register menu items correctly.
- Dropdown menu triggers now support keyboard opening with Enter and ArrowDown by default.
- Promoted dialog, drawer, dropdown-menu, popover, toast, and tooltip to beta in the component status matrix.
- Updated toast docs and snippets to use a stable `TemplateRef` query for Angular 21.

### Fixed

- Fixed `VoltSelect` declaring `valueChange` twice; `value = model(...)` now owns the generated `valueChange` output.
- Fixed keyboard-opened dropdown menus not moving focus to the first visible menu item.
- Fixed `volt-toast-close` so click, Enter, and Space dismiss the active toast.
- Fixed nested dropdown Escape handling in dialog demos by exposing `closeOnEscape` on `voltDialog`.

## [0.5.0] - 2026-07-04

### Added

- Added full Forms contract tests for `input`, `textarea`, `checkbox`, `radio`, `switch`, `toggle`, `toggle-group`, `slider`, and `select`.
- Added `ControlValueAccessor` support to `VoltRadioGroup` and `VoltToggleGroup`.
- Added template-driven forms smoke coverage for CVA-backed form controls.
- Added form-field tests for label association, hint/error wiring, and projected input/select/textarea controls.
- Added Reactive Forms usage snippets for promoted form controls.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.5.0`.
- Promoted form controls with the full CVA contract in `COMPONENT_STATUS.md`.
- Promoted `select` from experimental to beta now that its Forms contract is covered; overlay hardening remains scheduled separately.
- Kept `search` as a structural wrapper around `NgpSearch`; use `volt-input type="search"` for CVA-backed search inputs.

### Fixed

- Forms-driven disabled state now composes with attribute-driven disabled state for `radio`, `toggle-group`, and `slider`.
- CVA-backed controls now expose `aria-invalid="true"` when their Angular form control is invalid and touched.
- Radio and toggle-group items now inherit group-level disabled state.

## [0.4.0] - 2026-07-03

### Added

- Added shared component metadata for docs grouping and release stability labels.
- Added `stable`, `beta`, and `experimental` badges to the components index and sidebar.
- Added stability metadata to the generated CLI manifest.
- Added grouped `volt list` output with descriptions, `--status=<stable|beta|experimental>` filtering, and `--json`.
- Added `pack:lib`, `release:check`, and `release:minor` scripts for the minor release path.
- Added dedicated `variants.ts` files for CVA-based components so variant styling can be maintained separately from component behavior.

### Changed

- Bumped the root package, `@voltui/components`, and `@voltui/cli` to `0.4.0`.
- Updated README and component status guidance to recommend stable components while keeping all components available.
- Aligned component status labels around release confidence instead of hiding experimental components.
- Updated package dry-run scripts to use a repo-local npm cache so release checks do not depend on the user's global npm cache permissions.
- Updated docs source snippets and CLI manifest output to include component `variants.ts` files.

### Fixed

- `VoltButton` now defaults to `type="button"` and accepts an explicit `type` input for submit/reset usage.
- Button-like controls now render `type="button"` internally to avoid accidental form submissions.

## [0.2.0] - 2026-06-18

### Added

- Added `AGENTS.md` with project conventions and contribution guidelines for AI assistants.
- Added real Angular unit tests for `VoltButton`, `VoltCheckbox`, `VoltInput`, `VoltSwitch`, `VoltRadio`, `VoltTabs`, `VoltSlider`, `VoltSelect`, and `VoltDialog` using `@testing-library/angular` and `TestBed`.
- Added `cn()` utility in `projects/volt/src/lib/utils.ts` for merging Tailwind classes.
- CLI now copies components from the local filesystem instead of downloading from GitHub raw URLs.
- CLI now resolves and copies transitive component dependencies automatically.
- CLI now detects the project's package manager and prints the install command for runtime dependencies.
- CLI supports `--install` to install runtime dependencies automatically.
- CLI creates/updates an `index.ts` barrel file in the target directory.

### Changed

- Adopted a shadcn/ui-style architecture: components are intended to be copied into consumer projects and owned there.
- Removed embedded `styles:` CSS from components (`avatar`, `separator`, `progress`, `checkbox`, `switch`, `radio`, `select`, `slider`, `meter`) so they rely purely on Tailwind utilities.
- Refactored theme CSS to avoid recursive CSS variables: source tokens now use the `--volt-*` prefix (e.g. `--volt-shadow-sm`).
- Updated components to use Tailwind utilities directly (`shadow-lg`, `rounded-md`, `font-medium`, `bg-foreground`) instead of `var(--...)` escapes.
- Standardized all boolean inputs to use `booleanAttribute` transform (`disabled`, `readonly`, `required`, `multiple`, `trackPosition`, `showOnOverflow`, `useTextContent`).
- Refactored `VoltToast` and `VoltDialogContent` to use `class-variance-authority` / `cn()` consistently.
- Bumped root and CLI package versions to `0.2.0` to align with `@voltui/components`.
- Updated `tsconfig.spec.json` to include library component tests.
- Updated `README.md` and `CLI.md` to reflect the new shadcn-style workflow.

### Fixed

- Fixed CLI manifest generation to exclude `.spec.ts` and `.test.ts` files from component bundles.
- Corrected source-string tests that asserted the old `input(false)` and embedded-critical-styles patterns.

## [0.1.0] - 2026-06-07

### Added

- Initial alpha release of Volt UI component library
- 40+ accessible components built on ng-primitives
- CLI for adding components (`volt add`)
- MCP support for AI assistants (Claude, Cursor, Copilot, VS Code, Windsurf)
- Dark mode and theming system with 5 colors × 5 styles (25 presets)
- Documentation site powered by AnalogJS with SSR
- Layout showcase pages (admin, analytics, chat, kanban, etc.)
- CI/CD pipeline with GitHub Actions + Cloudflare Pages deploy
- ESLint flat config, Prettier, Husky, and lint-staged

### Changed

- Unified file naming: removed `.component` suffix from all component files for consistency
- `package.json`: moved `@types/node` to devDependencies, removed `node` and `cva` from production dependencies
- `wrangler.toml`: aligned build output directory with CI (`dist/analog/public`)

### Fixed

- Corrected package version from `0.0.0` to `0.1.0`
- Added `engines` requirement (`node >= 20`, `pnpm >= 9`)
