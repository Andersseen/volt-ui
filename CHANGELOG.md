# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-18

### Added

- Added `AGENTS.md` with project conventions and contribution guidelines for AI assistants.
- Added real Angular unit tests for `VoltButton`, `VoltCheckbox`, and `VoltInput` using `@testing-library/angular` and `TestBed`.
- Added `cn()` utility in `projects/volt/src/lib/utils.ts` for merging Tailwind classes.
- CLI now resolves and copies transitive component dependencies automatically.
- CLI now detects the project's package manager and prints the install command for runtime dependencies.

### Changed

- Refactored theme CSS to avoid recursive CSS variables: source tokens now use the `--volt-*` prefix (e.g. `--volt-shadow-sm`).
- Updated components to use Tailwind utilities directly (`shadow-lg`, `rounded-md`, `font-medium`, `bg-foreground`) instead of `var(--...)` escapes.
- Standardized all boolean inputs to use `booleanAttribute` transform (`disabled`, `readonly`, `required`, `multiple`, `trackPosition`, `showOnOverflow`, `useTextContent`).
- Refactored `VoltToast` and `VoltDialogContent` to use `class-variance-authority` / `cn()` consistently.
- Bumped root and CLI package versions to `0.2.0` to align with `@voltui/components`.
- Updated `tsconfig.spec.json` to include library component tests.

### Fixed

- Fixed CLI manifest generation to exclude `.spec.ts` and `.test.ts` files from downloadable component bundles.
- Improved CLI fetch resilience with automatic retries on network errors.
- Corrected source-string tests that asserted the old `input(false)` pattern.

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
