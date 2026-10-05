---
name: run-plan
description: Execute a spec-driven plan from specs/plans/ following the repo's execution protocol. Usage: /run-plan v0.7 [phase N]
disable-model-invocation: true
---

# Run a spec plan

Packages the execution protocol from `specs/README.md` and `specs/SPEC.md` §5.

Argument: the plan version (`v0.7`, `v0.8`, `v0.9`, `v1.0`). Optional `phase N` to target
a specific phase. With no argument, list the plans in `specs/plans/` with their **Status**
headers and ask which to run.

## Protocol — follow in order, do not skip

1. **Read `specs/GUARDRAILS.md`.** Hard rules, ripple effects, troubleshooting. It
   overrides everything except direct user instructions. A plan never overrides it.
2. **Read `specs/SPEC.md` §5** (execution protocol).
3. **Read the plan file top to bottom.** Its _Context primer_ replaces repo analysis —
   trust it, don't re-derive the codebase.
4. **Verify entry state** with the commands the plan lists (cheap, < 1 min). If they
   fail, fix entry state or stop. Never build on a broken base.
5. **Work phase by phase**, starting at the first unchecked phase (or the requested one).
   Check off each task's checkbox in the plan file as you complete it.
6. **Copy code shapes from `specs/patterns/`** — component anatomy, form-control contract
   tests, overlay tests, docs pages. Do not invent shapes.
7. After each meaningful unit run the narrow check first
   (`pnpm vitest --run <file>`), then the full suite before any commit.

## Scope discipline

- **Never expand scope.** Work belonging to a later minor goes as a note in _that_ plan
  file — you do not do it.
- Blocked or unsure for more than ~15 minutes on one decision? Write it under an
  `## Open questions` heading at the bottom of the plan file (create the heading if
  missing), take the most conservative interpretation or skip the task, and continue.
- Never invent APIs. Never delete a test to make CI pass. Never loosen an assertion to
  go green.
- No new npm dependency without writing the justification into the plan file first.

## Stopping cleanly

Phases are sized so a session can finish at least one and stop. Before you finish:

1. Run the plan's verification commands.
2. Update the plan's **Status** header — `not started` / `in progress — phase N` / `done`.
3. Update `CHANGELOG.md` under `[Unreleased]` if the minor isn't released yet.
4. Report: phases completed, what's left, and any Open questions you recorded.

Audit phases write their findings **into the plan file itself** — that is what lets the
next session resume with full context. Do not report audit findings only in chat.

## Release gate

Every plan ends with the same gate. Only run it if the plan says to, and only after the
user confirms:

```bash
pnpm release:check
```

Then version bumps, CHANGELOG, `COMPONENT_STATUS.md`. Never publish to npm or deploy
unless the plan's release phase explicitly says so **and** the user confirms
(GUARDRAILS rule 11). Commits use conventional style (`feat:`, `fix:`, `test:`,
`docs:`, `chore:`); do not push unless asked.
