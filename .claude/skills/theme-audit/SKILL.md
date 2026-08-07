---
name: theme-audit
description: Sweep a component across the 5 color × 5 style presets plus dark mode to catch tokens that only resolve under the default theme. Usage: /theme-audit <component>
disable-model-invocation: true
---

# Theme audit across presets

Volt UI ships **5 colors × 5 styles × light/dark = 50 combinations**. A component that
looks right under the default (`volt` + `sharp`, light) can be unreadable under
`dusk` + `ghost` dark. This skill sweeps them.

Argument: the component name in kebab-case. With no argument, audit the components touched
in the working tree.

## The theme mechanism (do not guess it)

Theming is three independent switches on `<html>`, applied by `applyVoltTheme()` in
`projects/volt/src/lib/components/theme/theme.ts`:

| Switch | Where                              | Values                                  |
| ------ | ---------------------------------- | --------------------------------------- |
| color  | `data-color` attribute on `<html>` | `volt` `ember` `sage` `dusk` `glacier`  |
| style  | `data-style` attribute on `<html>` | `sharp` `soft` `brutal` `ghost` `retro` |
| dark   | `.dark` **class** on `<html>`      | present / absent                        |

Dark mode is a class, not a media query — `core.css` declares
`@custom-variant dark (&:where(.dark, .dark *))`. The docs app persists choices in
`localStorage` under `volt-color`, `volt-style`, `volt-dark`.

Token sources live in `projects/volt/src/themes/`: `colors/*.css`, `styles/*.css`, and the
25 precomputed pairs in `presets/*.css`.

## Step 1 — Static pass first (cheap, catches most of it)

Grep the component before opening a browser. These are the patterns that break across
presets, and they are findable without rendering anything:

```bash
C=projects/volt/src/lib/components/<name>
grep -nE "#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(" $C/*.ts          # hardcoded color
grep -nE "\[var\(--" $C/*.ts                                  # bg-[var(--primary)] instead of bg-primary
grep -nE "\b(white|black|gray|slate|zinc|neutral)-[0-9]{2,3}\b" $C/*.ts  # Tailwind palette instead of semantic token
grep -nE "dark:" $C/*.ts                                      # manual dark: — semantic tokens should already flip
```

Every hit is a finding. `AGENTS.md` is explicit: use Tailwind utilities bound to semantic
tokens (`bg-primary`, `rounded-md`, `shadow-lg`), never `bg-[var(--primary)]` and never a
raw palette color. A semantic token already resolves per preset _and_ per light/dark, so a
`dark:` override on one usually means the wrong token underneath.

Also run the repo's own contrast checker:

```bash
pnpm check:contrast     # scripts/contrast-audit.mjs
```

## Step 2 — Browser sweep

`pnpm dev`, navigate to `/docs/components/<name>`, then drive the switches directly:

```js
// browser_evaluate — no reload needed, the attributes are live
const set = (color, style, dark) => {
  const r = document.documentElement;
  r.setAttribute('data-color', color);
  r.setAttribute('data-style', style);
  r.classList.toggle('dark', dark);
  r.style.colorScheme = dark ? 'dark' : 'light';
};
set('dusk', 'ghost', true);
```

You do not need all 50. These six catch essentially everything, because each isolates a
different token family:

| #   | color     | style    | dark  | What it isolates                              |
| --- | --------- | -------- | ----- | --------------------------------------------- |
| 1   | `volt`    | `sharp`  | light | baseline — must be perfect                    |
| 2   | `volt`    | `sharp`  | dark  | foreground/background pairing flips           |
| 3   | `ember`   | `brutal` | light | heavy borders + offset shadows; border tokens |
| 4   | `dusk`    | `ghost`  | dark  | borderless + low contrast; the worst case     |
| 5   | `glacier` | `retro`  | light | unusual radii and shadow shapes               |
| 6   | `sage`    | `soft`   | dark  | muted palette, soft radii                     |

Screenshot each. For anything with state (hover, open, checked, disabled), capture that
state too — a disabled style that vanishes under `ghost` is a real bug.

## Step 3 — What counts as a finding

- text that disappears or drops below readable contrast (a foreground token not paired with
  the background it is actually on)
- a border that vanishes under `ghost`, or overwhelms under `brutal`
- a shadow that resolves to nothing — usually `shadow-[var(--volt-shadow-lg)]` instead of
  `shadow-lg`, so `@theme inline` never mapped it
- focus ring invisible against the surface in dark mode
- any hardcoded color, which by definition ignores all 50 combinations

## Step 4 — Report

One table: preset → finding → the exact file and line. Then the fix, which is almost always
"swap the literal or arbitrary value for the semantic Tailwind utility". Do not add a
`dark:` override to patch a bad token — fix the token binding, or the same bug reappears in
the other 49 combinations.

If a token genuinely does not exist for what the component needs, that is a
`projects/volt/src/themes/core.css` change: add the `--volt-*` source variable and map it
in `@theme inline`. Never introduce a recursive CSS variable (`AGENTS.md`).
