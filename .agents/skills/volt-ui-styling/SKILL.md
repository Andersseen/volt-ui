---
name: volt-ui-styling
description: >
  Customise Volt UI without rebuilding it: semantic tokens, colour and style presets, light/dark,
  the class merge contract, variants and sizes, native directives, layout wrappers, accessible
  status colours. Use when changing how Volt components look or fit into a layout.
---

# Styling Volt

**Customise Volt; do not rewrite it by accident.**

## Order of preference

1. **Variants and sizes** (`variant`, `size`, `state`) — the component's own design range. Ask the
   MCP server which exist (`get_component`).
2. **The theme** — change tokens or presets, and every component follows.
3. **`class` on the component** — adjusts the one instance.
4. **A wrapper in your layout** — for placement.

Only then consider copying the component (copy mode) and editing it.

## Tokens and presets

- Use **semantic utilities**: `bg-primary`, `text-foreground`, `border-border`, `bg-muted`,
  `text-muted-foreground`, `rounded-md`. Not `bg-[var(--primary)]`, not hard-coded hex.
- Colour presets: `volt`, `ember`, `sage`, `dusk`, `glacier`. Style presets: `sharp`, `soft`,
  `brutal`, `ghost`, `retro`. Dark mode is a class on `<html>`. `provideVoltTheme({ color, style,
dark })` sets them at bootstrap; `applyVoltTheme` changes them at runtime.
- Import the theme CSS once: `@import '@voltui/components/themes.css';` after Tailwind.
- A custom palette overrides the `--volt-*` source variables, not the Tailwind utilities.

## The `class` contract

`class` on a Volt component is merged over the defaults with `tailwind-merge`, on the element that
paints. So `class="p-3"` **replaces** the default padding instead of fighting it, and
`class="w-24 font-mono"` on an input styles the native `<input>`. You do not need `!important`,
`[&&]` hacks or `::ng-deep`.

Wrappers around one native control move a static `class`, `id` and `aria-label` from the host to that
control — set them on the Volt tag as usual.

## Layout belongs to you

Grid, flex, gap, width and margin that place a component in the page go on a **wrapper element** in
your layout (or on `class` for a one-off), not into a copy of the component.

## Status colours

Use the semantic variants (`success`, `warning`, `info`, `destructive`) and pair colour with text or
an icon — colour alone does not carry meaning, and the presets are contrast-checked only for those
pairs. In a custom palette check the pairs you change.

## Do not

- Duplicate a component's internal classes in your own markup.
- Use arbitrary values (`bg-[#3b82f6]`) where a token exists.
- Style a state with `:hover`-only changes — pressed, selected and checked states must be visibly
  different too (and have enough contrast).

<!-- volt:digest:start -->

- Prefer variants/sizes, then the theme, then `class` on the component (merged with tailwind-merge, so it replaces defaults), then a layout wrapper. Do not rewrite a component.
- Use semantic utilities (`bg-primary`, `text-foreground`, `border-border`), never hard-coded colours or `bg-[var(--x)]`.
- Presets: colour `volt|ember|sage|dusk|glacier`, style `sharp|soft|brutal|ghost|retro`; dark mode is a class on `<html>`.
- Pressed/selected/checked states must be visibly distinct and contrast-checked; colour alone is not meaning.

<!-- volt:digest:end -->
