# Contributing to Volt UI

Thanks for helping improve Volt UI. Bug fixes, accessibility improvements,
tests and documentation are especially welcome during pre-v1 hardening.

## Setup

1. Fork and clone the repository.
2. Install Node 22 and pnpm 10.
3. Run `pnpm install`.
4. Run `pnpm dev` for the docs application.

## Before opening a pull request

```bash
pnpm lint
pnpm typecheck
pnpm check:ai-docs
pnpm test:coverage
pnpm build:lib
pnpm test:e2e:ci
pnpm test:e2e:consumer
```

`pnpm test:all` runs the same complete verification locally.

## Components

1. Add or edit source under `projects/volt/src/lib/components/<name>/`.
2. Export new public APIs from `projects/volt/src/public-api.ts`.
3. Add a real colocated `*.spec.ts` using Testing Library or TestBed.
4. Update the docs page under
   `src/app/pages/(components-docs)/docs/components/`.
5. Update snippets and AI references required by `AGENTS.md`.
6. Run `pnpm manifest` after component source changes.

Use standalone components, `OnPush`, signal APIs and semantic Tailwind utilities.
Boolean inputs must use `booleanAttribute`. Accessibility and keyboard contracts
are part of the component API, not optional polish.

## Commits and pull requests

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`,
`chore:`). Keep pull requests focused, describe the user-visible behavior and
include tests for regressions. Update `CHANGELOG.md` for notable user-facing
changes.

By participating, you agree to follow [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
Security reports must follow [SECURITY.md](./SECURITY.md), not public issues.
