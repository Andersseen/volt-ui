import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

const COLORS = ['volt', 'ember', 'sage', 'dusk', 'glacier'] as const;
const STYLES = ['sharp', 'soft', 'brutal', 'ghost', 'retro'] as const;
const DENSITIES = ['compact', 'comfortable', 'spacious'] as const;

export type VoltThemeColor = (typeof COLORS)[number];
export type VoltThemeStyle = (typeof STYLES)[number];

export type VoltThemeDensity = (typeof DENSITIES)[number];

declare const CUSTOM_COLOR: unique symbol;
declare const CUSTOM_STYLE: unique symbol;

/**
 * The name of a palette your own stylesheet defines (`:root[data-color='acme']`, for example the
 * CSS Theme Studio exports). Only `voltCustomColor()` creates one, so a typo or an unchecked string
 * cannot reach the theme APIs where a palette name is expected.
 */
export type VoltCustomColor = string & { readonly [CUSTOM_COLOR]: true };

/** The name of a style preset your own stylesheet defines (`:root[data-style='…']`). See `voltCustomStyle()`. */
export type VoltCustomStyle = string & { readonly [CUSTOM_STYLE]: true };

/** A palette the theme APIs accept: one of the five shipped ones, or a declared custom one. */
export type VoltThemeColorName = VoltThemeColor | VoltCustomColor;

/** A style the theme APIs accept: one of the five shipped ones, or a declared custom one. */
export type VoltThemeStyleName = VoltThemeStyle | VoltCustomStyle;

/**
 * A theme: palette, style, mode and density. Without type arguments it holds only the shipped
 * presets, as it always has; the theme functions and `voltTheme` accept
 * `VoltThemeOptions<VoltThemeColorName, VoltThemeStyleName>`, which adds declared custom names.
 */
export interface VoltThemeOptions<
  TColor extends string = VoltThemeColor,
  TStyle extends string = VoltThemeStyle,
> {
  color?: TColor;
  style?: TStyle;
  dark?: boolean;
  density?: VoltThemeDensity;
}

/** What every theme API accepts: shipped presets plus declared custom names. */
export type VoltAnyThemeOptions = VoltThemeOptions<VoltThemeColorName, VoltThemeStyleName>;

/**
 * Lowercase letters, digits and single hyphens, starting with a letter: a name that is safe in an
 * attribute selector, an HTML attribute and a storage record, at most 48 characters.
 */
const THEME_NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const THEME_NAME_MAX = 48;

function isThemeName(value: unknown): value is string {
  return typeof value === 'string' && value.length <= THEME_NAME_MAX && THEME_NAME.test(value);
}

function declareName(kind: 'color' | 'style', name: string, shipped: readonly string[]): string {
  if (!isThemeName(name)) {
    throw new Error(
      `[volt] "${String(name)}" is not a valid custom ${kind} name: use lowercase letters, digits ` +
        `and single hyphens, starting with a letter (at most ${THEME_NAME_MAX} characters).`
    );
  }
  if (shipped.includes(name)) {
    throw new Error(
      `[volt] "${name}" is a shipped ${kind}; a custom ${kind} needs a name of its own.`
    );
  }
  return name;
}

/**
 * Declares a palette your stylesheet defines, so the theme APIs accept it:
 *
 * ```ts
 * export const acme = voltCustomColor('acme'); // :root[data-color='acme'] { … } in your CSS
 * provideVoltTheme({ color: acme });
 * ```
 *
 * Throws for a name that is not a safe identifier or that collides with a shipped palette. It only
 * validates and brands the name; nothing is registered globally and no stylesheet is loaded.
 */
export function voltCustomColor(name: string): VoltCustomColor {
  return declareName('color', name, COLORS) as VoltCustomColor;
}

/** Declares a style preset your stylesheet defines (`:root[data-style='…']`). See `voltCustomColor`. */
export function voltCustomStyle(name: string): VoltCustomStyle {
  return declareName('style', name, STYLES) as VoltCustomStyle;
}

function getDocument(doc?: Document): Document | null {
  if (doc) {
    return doc;
  }

  return typeof document !== 'undefined' ? document : null;
}

/** Malformed names are dropped (with a warning in development) instead of written to the DOM. */
function safeName(kind: 'color' | 'style', value: string | undefined): string | undefined {
  if (value === undefined || value === '') return undefined;
  if (isThemeName(value)) return value;
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    console.warn(`[volt] Ignoring a malformed theme ${kind}: ${JSON.stringify(value)}`);
  }
  return undefined;
}

export function applyVoltTheme(options: VoltAnyThemeOptions = {}, doc?: Document): void {
  const activeDocument = getDocument(doc);
  if (!activeDocument) {
    return;
  }

  const root = activeDocument.documentElement;
  const color = safeName('color', options.color);
  const style = safeName('style', options.style);

  if (color) {
    root.setAttribute('data-color', color);
  }

  if (style) {
    root.setAttribute('data-style', style);
  }

  if (options.density) {
    root.setAttribute('data-density', options.density);
  }

  if (options.dark !== undefined) {
    root.classList.toggle('dark', options.dark);
    root.style.colorScheme = options.dark ? 'dark' : 'light';
  }
}

export function provideVoltTheme(options: VoltAnyThemeOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      // Reads the platform-provided Document (the domino-backed document on
      // the server, the real one in the browser) instead of the global
      // `document`, which is undefined during SSR — without this, an SSR
      // app never gets data-color/data-style/.dark in the server-rendered
      // HTML, causing a themed-then-unthemed flash before hydration.
      applyVoltTheme(options, inject(DOCUMENT));
    }),
  ]);
}

/** The `localStorage` key `persistVoltTheme` and `voltThemeInitScript` share by default. */
export const VOLT_THEME_STORAGE_KEY = 'volt-theme';

export interface VoltThemeInitScriptOptions {
  /** Where the visitor's theme is stored (`persistVoltTheme` writes it). Default `volt-theme`. */
  storageKey?: string;
  /** The theme before the visitor picked one. Its `dark`, if set, wins over the system setting. */
  defaults?: VoltAnyThemeOptions;
  /**
   * Custom palettes a stored choice may name, besides the shipped five. A stored name that is in
   * neither list is ignored, so the page falls back to `defaults`. A custom `defaults.color` must be
   * listed here too.
   */
  customColors?: readonly VoltCustomColor[];
  /** Custom styles a stored choice may name, besides the shipped five. See `customColors`. */
  customStyles?: readonly VoltCustomStyle[];
  /** With no stored or default `dark`, follow `prefers-color-scheme`. Default `true`. */
  followSystem?: boolean;
}

/** JSON that is also safe inside an inline `<script>` (no `</script>`, no line separators). */
function scriptLiteral(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Source of a tiny inline script that applies the visitor's stored theme before first paint, the
 * same way `applyVoltTheme` does, so an SSR or prerendered page never flashes the default theme.
 * Put its output in a `<script>` at the top of `<head>` (`index.html`, or your server template);
 * store the visitor's choice with `persistVoltTheme`. Unknown or tampered values are ignored, and a
 * browser that denies storage gets the defaults. Pure: safe to call on the server.
 */
export function voltThemeInitScript(options: VoltThemeInitScriptOptions = {}): string {
  const key = scriptLiteral(options.storageKey ?? VOLT_THEME_STORAGE_KEY);
  const defaults = scriptLiteral(options.defaults ?? {});
  const followSystem = options.followSystem ?? true;
  // Re-validated: a cast or a JavaScript caller can bypass the branded type.
  const colors = [...COLORS, ...(options.customColors ?? []).map(name => voltCustomColor(name))];
  const styles = [...STYLES, ...(options.customStyles ?? []).map(name => voltCustomStyle(name))];
  return (
    `(function(){var C=${scriptLiteral(colors)},S=${scriptLiteral(styles)},D=${scriptLiteral(DENSITIES)};` +
    `var t=${defaults},s={};` +
    `try{s=JSON.parse(localStorage.getItem(${key})||'{}')||{}}catch(e){}` +
    `var c=C.indexOf(s.color)>-1?s.color:t.color,y=S.indexOf(s.style)>-1?s.style:t.style,` +
    `n=D.indexOf(s.density)>-1?s.density:t.density,` +
    `k=typeof s.dark==='boolean'?s.dark:typeof t.dark==='boolean'?t.dark:` +
    (followSystem
      ? `(function(){try{return matchMedia('(prefers-color-scheme: dark)').matches}catch(e){return undefined}})();`
      : `undefined;`) +
    `var r=document.documentElement;` +
    `if(C.indexOf(c)>-1)r.setAttribute('data-color',c);` +
    `if(S.indexOf(y)>-1)r.setAttribute('data-style',y);` +
    `if(D.indexOf(n)>-1)r.setAttribute('data-density',n);` +
    `if(typeof k==='boolean'){r.classList.toggle('dark',k);r.style.colorScheme=k?'dark':'light'}})();`
  );
}

/**
 * Stores the visitor's theme where `voltThemeInitScript` reads it, merged over what is stored, and
 * applies it. `dark: undefined` keeps the stored choice. No-op on the server; storage errors (private
 * mode, quota) are ignored, the theme is still applied.
 */
export function persistVoltTheme(
  options: VoltAnyThemeOptions,
  storageKey: string = VOLT_THEME_STORAGE_KEY,
  doc?: Document
): void {
  const activeDocument = getDocument(doc);
  const storage = activeDocument?.defaultView?.localStorage;
  if (storage) {
    try {
      const stored = JSON.parse(storage.getItem(storageKey) ?? '{}') ?? {};
      const next = { ...stored };
      for (const [name, value] of Object.entries(options)) {
        if (value === undefined) continue;
        // A malformed name is not stored: the init script would only have to discard it.
        if ((name === 'color' || name === 'style') && !isThemeName(value)) continue;
        next[name] = value;
      }
      storage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage denied or full: the theme still applies for this page.
    }
  }
  applyVoltTheme(options, activeDocument ?? undefined);
}
