# Component polish — visual evidence

Real captures of the four families this change touched (Navigation Menu, Date Picker / Date Range Picker,
Spinner, Empty State) and the docs "On this page" table of contents, in the five reference combinations of
palette × style × scheme plus two densities. They show what changed; they prove nothing on their own. The
assertions are computed styles and behaviour in `e2e/contracts/polish.spec.ts` (packed package, Chromium,
Firefox and WebKit in the Contract Evidence workflow) and `e2e/docs-toc.spec.ts` (docs site).

| File                                                                                         | Combination                        |
| -------------------------------------------------------------------------------------------- | ---------------------------------- |
| [`volt-sharp-light.jpg`](volt-sharp-light.jpg)                                               | Volt · Sharp · light               |
| [`dusk-soft-dark.jpg`](dusk-soft-dark.jpg)                                                   | Dusk · Soft · dark                 |
| [`sage-brutal-dark.jpg`](sage-brutal-dark.jpg)                                               | Sage · Brutal · dark               |
| [`glacier-ghost-light.jpg`](glacier-ghost-light.jpg)                                         | Glacier · Ghost · light            |
| [`ember-retro-dark.jpg`](ember-retro-dark.jpg)                                               | Ember · Retro · dark               |
| [`density-compact.jpg`](density-compact.jpg), [`density-spacious.jpg`](density-spacious.jpg) | Volt · Soft · light, two densities |

Each sheet: the four `variant`s with "Docs" as the current page, `pill` + `layout="contained"`, a keyboard
focus ring and an open submenu; the calendar with a selected, hovered, disabled and keyboard-focused day and
a range; the three spinner sizes, a labelled status and a spinner in a disabled button; Empty State with an
icon and two actions and with unbroken text at 320 px; the TOC active, hovered and focused.

Deterministic: fixed dates (July 2026, March 2031), transitions and animations off, reduced motion, 1280 px
viewport at 1× scale. Captured from the packed package (`e2e/consumer` contracts fixture) and the docs dev
server. Regenerate only when one of these components changes visibly.

The dark-mode finding behind the calendar fix: `accent` (= `muted`) and `popover`
(`surface-elevated`) resolve to almost the same lightness in dark palettes, so a hovered day and the range
body were invisible on the calendar (compare a dark sheet with the light one). The calendar now tints from
`foreground` and `primary`. Menu-style items on popovers elsewhere (dropdown, select, listbox, combobox,
navigation menu panels) share the same token pair and are left for a theme-contract follow-up.
