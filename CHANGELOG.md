# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-07

### Added

- Initial stable release of Volt UI component library
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
