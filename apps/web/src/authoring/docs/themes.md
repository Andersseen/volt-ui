---
title: 'Themes'
description: 'Customize the look and feel of your application with built-in themes, colors, and dark mode support.'
group: 'Getting Started'
order: 2
---

## Available Themes

Volt UI comes with five color presets. Each one sets its own palette for the primary, secondary, surface and semantic colors.

::demo[theme-presets]

## Theme Setup

Add the theme provider to your application configuration:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme } from '@voltui/components';

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: 'volt', style: 'soft', dark: false })],
};
```

## Color Options

### Theme Colors

Choose your primary color palette:

- `'volt'` — Blue (default)
- `'ember'` — Orange/Red
- `'sage'` — Green
- `'dusk'` — Purple
- `'glacier'` — Cyan

### Style Variants

Choose your component style:

- `'sharp'` — Small radius, flat shadows (default)
- `'soft'` — Large radius, diffuse shadows
- `'brutal'` — No radius, hard offset shadows, heavy borders
- `'ghost'` — No borders, no shadows
- `'retro'` — Y2K look

### Density

`density` scales control heights, padding and gaps through `--volt-density`: `compact` (0.875), `comfortable` (1, the default) or `spacious` (1.125). Set it for the whole document with `provideVoltTheme` / `applyVoltTheme`, or put `data-density` on any container to change one region.

## Runtime API

Two functions from `@voltui/components` control the theme at runtime. Both just set `data-color`, `data-style`, `data-density` and a `.dark` class (with the matching `color-scheme`) on `<html>` — there is no hidden state, so you can inspect or override the result with plain DOM APIs at any time.

### `provideVoltTheme(options)`

Environment provider. Call it once in `appConfig.providers` to set the theme at bootstrap, on both server and client.

**SSR-safe.** It reads Angular's `DOCUMENT` injection token rather than the global `document`, so the theme attributes are present in the server-rendered HTML itself — no flash of the default theme while the client bundle hydrates.

### `applyVoltTheme(options, doc?)`

Plain function. Call it from a click handler, an effect, or anywhere else you need to change the theme after bootstrap (e.g. a theme switcher).

Browser-only by default (it no-ops if `document` is undefined). Pass an explicit `doc` argument to target a different document, e.g. in a test.

```ts
// app.config.ts — set the theme at bootstrap
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme } from '@voltui/components';

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: 'ember', style: 'soft' })],
};
```

## Dark Mode Strategy

Dark mode is class-based: adding `.dark` to `<html>` switches every component to its dark token values (see `core.css`'s `@custom-variant dark`). Volt does **not** read `prefers-color-scheme` automatically — `dark` defaults to light unless you pass `dark: true` or call `applyVoltTheme` yourself, so the choice is always explicit and won't silently change if the visitor's OS theme changes.

```ts
import { applyVoltTheme, provideVoltTheme } from '@voltui/components';

// Static: dark by default (in your appConfig providers)
export const themeProviders = [provideVoltTheme({ color: 'volt', dark: true })];

// Dynamic: toggle from a button, a signal, etc.
applyVoltTheme({ dark: true });

// Opt in to following the OS preference yourself
const media = matchMedia('(prefers-color-scheme: dark)');
applyVoltTheme({ dark: media.matches });
media.addEventListener('change', e => applyVoltTheme({ dark: e.matches }));
```

### Remember the visitor's choice without a flash

`provideVoltTheme` renders the theme you configure. A theme the visitor picked lives in their browser, so the server cannot know it, and the page would first paint in the default theme. `voltThemeInitScript()` returns a few lines of JavaScript that read what `persistVoltTheme` stored and apply it before the first paint; inline them at the top of `<head>`. With no stored `dark` and no `defaults.dark` it follows `prefers-color-scheme` (`followSystem: false` turns that off). Unknown values are ignored, and `storageKey` changes the key both functions use.

```ts
import { persistVoltTheme, voltThemeInitScript } from '@voltui/components';

// When the visitor picks a theme: store it (localStorage, key "volt-theme") and apply it.
persistVoltTheme({ dark: true });

// Once, at build or server-render time: the source of the inline script for <head>.
const script = voltThemeInitScript({ defaults: { color: 'volt', style: 'soft' } });
```

```html
<head>
  <script>
    /* paste the output of voltThemeInitScript() here, or write it from your server template */
  </script>
  <!-- stylesheets after it -->
</head>
```

The script only reads storage and sets `data-color`, `data-style`, `data-density` and `.dark` on `<html>`, exactly as `applyVoltTheme` does, so a strict Content Security Policy needs its hash or a nonce like any inline script.

> [!NOTE]
> The docs site itself saves the visitor's choice in a cookie shared with Volt UI Recipes (falling back to older `localStorage` keys) and applies it from a small inline script in the `<head>` of `index.html`, before any stylesheet loads — see `packages/shared/components/theme-switcher.ts` and `packages/shared/lib/theme-preferences.ts` in the repository for a reference implementation if you want the same no-flash behavior.

## CSS Variables

Every preset sets the same set of semantic tokens as `oklch()` values. Components consume them through Tailwind utilities (`bg-primary`, `text-muted-foreground`) mapped via `@theme inline` in `core.css` — never a raw `var(--primary)`. This is the full list a preset can define; see the two guides below for copy-paste templates.

```css
/* Color tokens — one block per data-color, one per .dark[data-color] */
--background / --foreground
--surface / --surface-foreground        /* cards */
--surface-elevated                      /* popovers, menus, dialogs; derived, may be set */
--track                                 /* the unfilled part of Progress, Meter, Slider; derived */
--muted / --muted-foreground
--border / --input / --ring             /* --input is the form-control border */
--primary / --primary-foreground
--secondary / --secondary-foreground    /* a quiet fill, never a second accent */
--destructive / --destructive-foreground
--success / --success-foreground
--warning / --warning-foreground
--error / --error-foreground
--info / --info-foreground

/* Style tokens — one block per data-style */
--radius / --volt-radius-pill
--border-width                          /* surfaces */
--volt-control-border-width             /* inputs, outlines */
--volt-divider-width                    /* table rows, accordion items */
--volt-border-emphasis / --volt-surface-tint / --volt-control-solid-border
--ring-width / --ring-offset-width
--volt-shadow-sm / --volt-shadow / --volt-shadow-md / --volt-shadow-lg / --volt-shadow-xl
--volt-press-x / --volt-press-y / --volt-press-scale
--spacing-component / --spacing-gap
--volt-track-size / --volt-track-border-width / --volt-thumb-size
--volt-font-weight-base / --volt-font-weight-heading / --volt-font-weight-label

/* Density — data-density on the document or any container */
--volt-density                          /* compact 0.875, comfortable 1, spacious 1.125 */
```

## Create a Custom Color Preset

A color preset is a pair of selectors keyed by `data-color`: one for light, one for dark. [Theme Studio](/create-theme) writes it for you — start from any shipped palette, edit the tokens, check the contrast inspector, then copy or download the CSS. Its **Project** file (`.theme.json`) keeps the editable theme, so you can open it in the studio again later.

::demo[availability-custom-themes]

### 1. Import it after Volt's themes

Save the exported stylesheet (here `acme.css`) next to your global styles and import it **after** `@voltui/components/themes.css`. Order matters: the palette's shape overrides (radius, borders, ring, shadows) and a style preset use selectors of the same specificity, so the later file wins.

```css
/* styles.css */
@import 'tailwindcss';
@import '@voltui/components/themes.css';
@import './acme.css';
```

### 2. Declare the name, then use it like a shipped palette

`voltCustomColor()` turns the name into a `VoltCustomColor`, which every theme API accepts. It throws for a name that is not a lowercase identifier (`a-z`, digits, single hyphens, starting with a letter, at most 48 characters) or that belongs to a shipped palette. Nothing is registered globally and no stylesheet is loaded: the CSS you imported is still what paints.

```ts
// theme.ts
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme, voltCustomColor } from '@voltui/components';

export const acme = voltCustomColor('acme');

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: acme, style: 'soft', density: 'compact' })],
};
```

The same name works on a region with `voltTheme` — light, dark, and nested either way with the shipped palettes — and overlays opened inside it carry it along:

```ts
import { Component } from '@angular/core';
import { VoltButton, VoltTheme, voltCustomColor } from '@voltui/components';

const acme = voltCustomColor('acme');

@Component({
  selector: 'app-preview',
  imports: [VoltButton, VoltTheme],
  template: `
    <section [voltTheme]="{ color: acme, dark: true }">
      <volt-button>Dark acme island</volt-button>
    </section>
  `,
})
export class Preview {
  protected readonly acme = acme;
}
```

To restore a visitor's stored palette before the first paint, list your palettes in `voltThemeInitScript`. A stored name that is in neither list — tampered, or from an old release — is ignored and the defaults apply.

```ts
import { voltCustomColor, voltThemeInitScript } from '@voltui/components';

const acme = voltCustomColor('acme');
export const themeScript = voltThemeInitScript({
  defaults: { color: acme },
  customColors: [acme],
});
```

With CLI-copied components the same code imports from your UI folder and the CLI renames the `volt` prefix: `uiCustomColor` from `./ui/theme`. Custom style presets work the same way with `voltCustomStyle()` and `customStyles`.

### Palette, style and density are separate

| What                            | Where it lives                                          | Who sets it                                   |
| ------------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| **Palette** (`data-color`)      | Your exported CSS: the color tokens of both modes       | `color: acme`                                 |
| **Shape overrides**             | The same CSS, only the values you changed in the studio | Imported after the style presets, so they win |
| **Style preset** (`data-style`) | Volt's style files: borders, shadows, weights           | `style: 'soft'`                               |
| **Density** (`data-density`)    | Volt's tokens                                           | `density: 'compact'`                          |

A nested `voltTheme` scope that does not set a style inherits the shape overrides of the scope around it, like any other inherited token.

### Writing one by hand

The selectors are the ones every shipped palette uses. Keep every foreground/background pair at 4.5:1 or better, and 3:1 for `--ring` and `--input` against `--background`.

```css
:root[data-color='mytheme'],
[data-volt-theme][data-color='mytheme'] {
  --primary: oklch(0.58 0.2 265);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.96 0.01 265);
  --secondary-foreground: oklch(0.15 0.01 265);
  --background: oklch(1 0 0);
  --foreground: oklch(0.15 0.01 265);
  --surface: oklch(1 0 0);
  --surface-foreground: oklch(0.15 0.01 265);
  --muted: oklch(0.96 0.005 265);
  --muted-foreground: oklch(0.5 0.02 265);
  --border: oklch(0.9 0.01 265);
  --input: oklch(0.65 0.02 265);
  --ring: oklch(0.58 0.2 265);
  --success: oklch(0.5 0.14 150);
  --success-foreground: oklch(0.98 0 0);
  --warning: oklch(0.7 0.16 70);
  --warning-foreground: oklch(0.2 0.05 70);
  --error: oklch(0.55 0.22 25);
  --error-foreground: oklch(0.98 0 0);
  --info: oklch(0.55 0.14 240);
  --info-foreground: oklch(0.98 0 0);
}

.dark[data-color='mytheme'],
.dark [data-volt-theme][data-color='mytheme']:not([data-mode='light']) {
  /* same tokens, tuned for a dark --background/--surface */
}
```

> [!TIP]
> Theme Studio's contrast inspector checks every pair Volt paints, in both modes, against the threshold of its role — the same pairs and maths as `scripts/contrast-audit.mjs`, which this project runs on its own presets. It is a token-level check, not a WCAG certification: rendered pages still need browser checks, a manual review and screen-reader testing.

## Create a Custom Style Preset

A style preset never touches color — only shape. It's keyed by `data-style` and applies to every color at once.

```css
:root[data-style='mystyle'],
[data-volt-theme][data-style='mystyle'] {
  --radius: 0.5rem; /* a length: 0rem, never a bare 0 */
  --volt-radius-pill: 9999px;
  --border-width: 1px;
  --volt-control-border-width: 1px;
  --volt-divider-width: 1px;
  --ring-width: 2px;
  --ring-offset-width: 2px;
  /* Not none: that would void the focus ring. Use 0 0 #0000. */
  --volt-shadow-sm: 0 1px 2px 0 var(--volt-shadow-tint);
  --volt-shadow: 0 1px 3px 0 var(--volt-shadow-tint);
  --volt-shadow-md: 0 4px 6px -1px var(--volt-shadow-tint);
  --volt-shadow-lg: 0 10px 15px -3px var(--volt-shadow-tint);
  --volt-shadow-xl: 0 20px 25px -5px var(--volt-shadow-tint);
  --spacing-component: 1;
  --spacing-gap: 0.5rem;
  --volt-font-weight-base: 400;
  --volt-font-weight-heading: 600;
  --volt-font-weight-label: 500;
}
```

Registration is the same as a color preset: put it in your global stylesheet after `@voltui/components/themes.css`, declare it with `const mystyle = voltCustomStyle('mystyle')`, then pass `style: mystyle` to `provideVoltTheme`, `applyVoltTheme` or `voltTheme`.
