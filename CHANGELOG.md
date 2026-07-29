# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
