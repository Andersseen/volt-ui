# Plan — Theme system consolidation

**Status:** implemented on `feat/theme-system-consolidation`; no version bump (see "Release").
**Target version:** the unreleased 1.4.0. npm `latest` is 1.3.3, 1.4.0 has never been published and
`RELEASING.md` forbids skipping numbers, so this ships in that same minor.
**Base:** `main` @ `56a4896`, source 1.4.0, ng-primitives 0.131.2, Angular 21.2+ and 22.
**Rule:** selectors, inputs, outputs, Forms contracts and the meaning of `class` do not change. Nothing here
adds a component family, moves a component to Quartz or touches the Quartz repository.

## Inventory at the base commit

| Item                                        | Finding                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `--border-width`, `--border-style`          | Declared by 5 styles, read by **0** components                                         |
| `--ring-width`, `--ring-offset-width`       | Declared by 5 styles, read by 0; 38 `ring-2` and 23 `ring-offset-2` hard-coded         |
| `--spacing-component`, `--spacing-gap`      | Declared by 5 styles, read by 0; 22 fixed heights, 42 `px-*`, 36 `py-*`, 31 `gap-*`    |
| `--radius`, `--volt-shadow-*`, font weights | Effective through `@theme inline`                                                      |
| `shadow-xl` (Dialog, Drawer)                | Tailwind's default in every style                                                      |
| `--secondary`                               | Read by Progress and Meter only: a strong accent in Sage, Ember, Dusk, Glacier         |
| `rounded-full`                              | 25 sites; 9 intrinsic (see `docs/theme-contract.md`), the rest now `rounded-pill`      |
| Header swatches                             | Fixed Tailwind colours; the playground read presets; the theme guide had a third set   |
| `packages/shared/styles/site.css`           | Own copy of the Tailwind mapping and `--radius: 0.5rem`: the site was not the contract |
| Theme Studio                                | Second copy of three palettes; exported `--shadow-*`, which nothing reads              |

## Acceptance cases

Each is observable in a browser, on the part that paints.

| #   | Case                                                                                     | Proved by                                  |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | All 50 combinations render with valid radii, legible text, no overflow, thumb in track   | `e2e/contracts/theme-matrix.spec.ts`       |
| 2   | Every pair of styles differs; each keeps its promise (Brutal 0px/2px/offset, Ghost …)    | `theme-matrix.spec.ts`                     |
| 3   | Palettes differ in neutrals, in both modes                                               | `theme-matrix.spec.ts`                     |
| 4   | Brutal and Retro shadows reach 3:1 against the page in dark mode                         | `theme-matrix.spec.ts`                     |
| 5   | Hover, press, focus, invalid, selected are visible in every style; press moves no layout | `theme-matrix.spec.ts`                     |
| 6   | Density changes metrics, keeps 24px targets, does not compound                           | `theme-matrix.spec.ts`                     |
| 7   | Progress: 0, mid, 100, custom range, null, clamping, dynamic, accessible name            | `progress.spec.ts`                         |
| 8   | Vertical Slider and Range Slider: geometry, keyboard, drag, no crossing                  | `e2e/contracts/range.spec.ts`              |
| 9   | `reset()`, `reset(value)`, disabled, no echo, drag after resize                          | `range.spec.ts`, `slider.spec.ts`          |
| 10  | A scope changes only its subtree; portalled overlays keep it                             | `e2e/contracts/theme-scope.spec.ts`        |
| 11  | A consumer `class` beats tokens on the painted part, in every style                      | `theme-scope.spec.ts`, `utils.spec.ts`     |
| 12  | CLI copies paint like the package                                                        | `e2e/consumer-cli-themes.spec.ts`          |
| 13  | ng-primitives and Quartz keep identical classes                                          | `backend-parity*.spec.ts`                  |
| 14  | Theme Studio output applies in a standalone app                                          | `create-theme.page.spec.ts`, `theme-scope` |
| 15  | Palette pairs clear WCAG on tokens, including derived and per-style paint                | `pnpm check:contrast`                      |

## Decisions

- **Roles over a global `border` change.** Tailwind's `--default-border-width` would have rewritten every
  consumer's own `border`. Surfaces, controls and dividers have separate widths instead.
- **`@theme inline` for metrics.** A derived custom property resolves on the element declaring it, so a density on
  a container would need every token re-declared there. Inlined into the utility, it resolves where it paints.
- **`--spacing-component` retuned, name kept.** It had never been applied. At 1.25 a 40px control would become 50px.
- **`reset(null)` policy.** A slider has no empty state; it returns to its resting input and the control keeps
  `null`. Native `<input type="range">` also shows a position for an empty value.
- **Quartz Select needs no `VoltThemeInherit`:** it renders in place, so CSS inheritance already carries the scope.
- **Progress `valueLabel`.** The suspected `min` bug did not reproduce: the class default was dead code and the
  primitive's own default already handled `min`. The default is aligned with it; no behaviour changed.

## Release

No bump. 1.4.0 is still unpublished; the failing step is npm authorisation (see `RELEASING.md`), which this work
does not touch.

## Open questions

- Glossa writes are unavailable in the session that built this (the MCP server rejected the token), so the theme
  guide gained no new prose: its code blocks changed, and density and scopes are documented in Storybook and
  `docs/theme-contract.md`. Add guide copy for them once Glossa is reachable.
