# specs/ — Spec-Driven Development for Volt UI

This folder drives the road from **0.4.0 to 1.0.0**.

- [`SPEC.md`](SPEC.md) — the vision, the v1.0 definition of done, the release ladder,
  and the execution protocol. **Read this first.**
- [`GUARDRAILS.md`](GUARDRAILS.md) — hard rules, required ripple effects when touching
  component files, and a troubleshooting table. **Mandatory before writing code.**
- [`plans/v0.5.md`](plans/v0.5.md) → [`plans/v1.0.md`](plans/v1.0.md) — one executable
  plan per minor version, in strict order.
- [`patterns/`](patterns/) — canonical code shapes extracted from real source. Copy
  these instead of inventing:
  - [`component.md`](patterns/component.md) — CVA component + CVA form control anatomy
  - [`form-control-tests.md`](patterns/form-control-tests.md) — the 6-point forms
    contract as a copy-paste spec skeleton
  - [`overlay-tests.md`](patterns/overlay-tests.md) — overlay contract, unit + Playwright
  - [`docs-page.md`](patterns/docs-page.md) — demo page + snippet registration steps

## How to run a session against a plan

Prompt template for the executing agent/model:

> Read `specs/GUARDRAILS.md`, then `specs/SPEC.md` section 5 (execution protocol), then
> execute `specs/plans/vX.Y.md` starting at the first unchecked phase. Verify entry
> state first. Copy code shapes from `specs/patterns/`. Update checkboxes and the
> Status header as you go. Do not expand scope. If blocked or unsure, write the
> question under "Open questions" in the plan file and continue with the next task.

Design intent:

- Each plan's **Context primer** carries enough repo knowledge that the session does not
  need to re-analyze the codebase — cheaper models can execute reliably.
- Phases are sized so a session can complete at least one phase and stop cleanly.
- Audit phases write their findings **into the plan file itself**, so the next session
  resumes with full context.
- Every plan ends with the same release gate (`pnpm release:check`, version bumps,
  CHANGELOG, COMPONENT_STATUS.md).
