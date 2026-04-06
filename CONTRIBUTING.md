# Contributing to Volt UI

Thank you for your interest in contributing! This document provides guidelines for contributing to Volt UI.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Run dev server: `pnpm dev`

## Code Style

- Use ESLint and Prettier (auto-format on save)
- Follow Angular style guide
- Use conventional commits

## Adding a Component

1. Create component in `projects/volt/src/lib/[component-name]/`
2. Add export to `public-api.ts`
3. Create demo page in `src/app/pages/docs/components/`
4. Add tests (minimum 70% coverage)
5. Update documentation

## Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that don't affect code meaning (formatting, semicolons, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `perf:` - Performance improvements
- `test:` - Adding or correcting tests
- `chore:` - Changes to build process or auxiliary tools

Examples:

```
feat: add new component
fix: resolve button disabled state
docs: update README
test: add coverage for checkbox
refactor: simplify dialog logic
```

## Pull Request Process

1. Ensure all tests pass: `pnpm test --run`
2. Ensure lint passes: `pnpm lint`
3. Update CHANGELOG.md if applicable
4. Create PR with clear description of changes
5. Link any related issues

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

Feel free to open an issue for discussion before starting work on major changes.
