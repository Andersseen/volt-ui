# Testing Volt UI

Volt UI uses Vitest and Testing Library for component contracts, and Playwright for
browser, overlay, keyboard, docs and real-consumer coverage.

## Commands

```bash
pnpm test:run          # all unit and integration specs once
pnpm test:coverage     # full-source coverage with enforced thresholds
pnpm test:e2e:ci       # production docs build and browser tests
pnpm test:e2e:consumer # packaged library in a consumer fixture
pnpm test:all          # the complete local CI pipeline
```

Coverage includes all TypeScript implementation files under
`projects/volt/src/lib`, the CLI core and the hosted MCP route. Files without a
test are therefore counted as uncovered. The thresholds in `vitest.config.ts`
are a floor, not a target; increases should be ratcheted upward and never lowered
to make a change pass.

## Required component contracts

Every component family must have a colocated `*.spec.ts`. Test observable
behavior rather than source strings:

- rendering, projected content and consumer classes;
- signal inputs, outputs and model updates;
- boolean/number input transforms;
- disabled and error states;
- Reactive Forms `writeValue`, change, touched and disabled behavior for CVAs;
- native or ARIA semantics;
- keyboard navigation, Escape and focus behavior where applicable.

Overlay and browser-only behavior belongs in Playwright. Source-copy and package
behavior belongs in the consumer fixture.

## Definition of done

A component change is complete only when lint, typecheck, coverage, library
packaging, AI-doc synchronization and the relevant E2E suites pass. New public
APIs must also update the docs, snippets, manifest and AI references listed in
`AGENTS.md`.
