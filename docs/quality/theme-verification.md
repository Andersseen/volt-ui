# Theme system verification

What was verified for the theme consolidation, where, and what was not. Scope and acceptance cases:
[`specs/plans/theme-consolidation.md`](../../specs/plans/theme-consolidation.md). Exact commit, GitHub Actions
runs and WebKit results are on the pull request.

## Reproduced before the fix

Run against the built package at `56a4896`, with the fixtures of this branch.

| Defect                                                 | Evidence at the base                                        |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| Vertical Slider and Range Slider                       | 4 geometry contracts failed in `range.spec.ts`              |
| `reset()` left thumbs in place                         | 3 contracts failed: value stayed at 20, 15, 25/75           |
| Ghost lost the focus ring on elements with `shadow-sm` | Found by the matrix once tokens applied: `box-shadow: none` |
| Switch thumb outside a 2px border                      | Seen in the first gallery capture                           |
| `volt add` omitted a sibling import                    | `check-quartz-consumer` failed on the CLI copy              |

**Not reproduced:** Progress's default percentage with `min` other than zero. The class default ignored `min`, but
it was dead code: the primitive's default is the one that runs, and it was already correct. Tests now pin 0, mid,
100 and shifted ranges.

## What was checked

| Check                                                                                        | Combinations                                     | Engines           |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------- |
| Valid radius, button contrast, progress contrast, input outline, no overflow, thumb in track | 50: 5 palettes × 5 styles × 2 modes              | Chromium, Firefox |
| Every pair of styles differs, each style's values                                            | 5 styles on Volt light                           | Chromium, Firefox |
| Palettes differ in page, card and border colour                                              | 5 palettes × 2 modes                             | Chromium, Firefox |
| Offset shadows ≥ 3:1 on the page                                                             | 5 palettes × Brutal, Retro, dark                 | Chromium, Firefox |
| Hover, press, focus ring, invalid, selected; press moves no layout                           | 5 styles, Volt light                             | Chromium, Firefox |
| Density, nesting, 24px floor                                                                 | Sharp, Volt light                                | Chromium, Firefox |
| Scope isolation, overlays, light in dark, overrides                                          | Ember/Brutal/dark island; 5 styles for overrides | Chromium, Firefox |
| Slider and Range Slider, both orientations                                                   | Default theme                                    | Chromium, Firefox |
| CLI copy paints like the package                                                             | Sage × Sharp, Brutal, Ghost × 2 modes, scope     | Chromium          |
| Quartz: consumer modes, a11y and paint                                                       | Default theme and the fixture's presets          | Chromium, Firefox |
| Token contrast                                                                               | 5 palettes × 2 modes, per-style paint            | Node, no browser  |

Screenshots: `node scripts/capture-theme-gallery.mjs --out <dir> --all`, 1280×900, reproducible from the fixture.
`docs/quality/theme-evidence/` holds six before/after pairs of real captures.

## Failures not caused by this work

`node scripts/check-quartz-consumer.mjs 22` fails on the development Mac: RTL arrows in three consumer modes, Quartz
Select keyboard, and the shared paint comparison that depends on them. The base commit `56a4896` fails the same tests
and one more on that machine. GitHub Actions passes the dual-backend job on Angular 22 in Chromium, Firefox and WebKit,
so this is specific to the local environment and is not a known Angular 22 defect.

## Limits

- **WebKit** cannot launch on the development Mac. Its results come only from GitHub Actions, where the contracts
  pass, the theme matrix included.
- **Hover, press and focus** run on one palette per style, since those paths do not vary by palette. Reduced motion
  is asserted on the Progress bar only.
- **Touch** is exercised through the same pointer path as the mouse. No touch-device emulation was run.
- **Contrast** in the matrix covers solid button text and progress fill. `pnpm check:contrast` is a token analysis
  of 660 pairs, not an audit of rendered pages. Neither is a full accessibility audit.
- **Screen readers** were not used. `docs/quality/manual-a11y-checklist.md` remains to be run by a person.
- **Visual review** covered the six pairs and a sample of the 50 by eye. The 50 are otherwise covered by computed
  assertions, not by image comparison.
- **Dialogs opened from a service** with a component, and **toasts**, do not inherit a scope (see the contract).
