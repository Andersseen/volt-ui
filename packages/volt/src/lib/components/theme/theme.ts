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

export interface VoltThemeOptions {
  color?: VoltThemeColor;
  style?: VoltThemeStyle;
  dark?: boolean;
  density?: VoltThemeDensity;
}

function getDocument(doc?: Document): Document | null {
  if (doc) {
    return doc;
  }

  return typeof document !== 'undefined' ? document : null;
}

export function applyVoltTheme(options: VoltThemeOptions = {}, doc?: Document): void {
  const activeDocument = getDocument(doc);
  if (!activeDocument) {
    return;
  }

  const root = activeDocument.documentElement;

  if (options.color) {
    root.setAttribute('data-color', options.color);
  }

  if (options.style) {
    root.setAttribute('data-style', options.style);
  }

  if (options.density) {
    root.setAttribute('data-density', options.density);
  }

  if (options.dark !== undefined) {
    root.classList.toggle('dark', options.dark);
    root.style.colorScheme = options.dark ? 'dark' : 'light';
  }
}

export function provideVoltTheme(options: VoltThemeOptions = {}): EnvironmentProviders {
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
  defaults?: VoltThemeOptions;
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
  return (
    `(function(){var C=${scriptLiteral(COLORS)},S=${scriptLiteral(STYLES)},D=${scriptLiteral(DENSITIES)};` +
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
  options: VoltThemeOptions,
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
        if (value !== undefined) next[name] = value;
      }
      storage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage denied or full: the theme still applies for this page.
    }
  }
  applyVoltTheme(options, activeDocument ?? undefined);
}
