import type { VoltThemeColor, VoltThemeDensity, VoltThemeStyle } from 'volt';
import { COLOR_PRESETS, STYLE_PRESETS } from './theme-presets';

/**
 * The visitor's chosen theme, as voltui.dev and recipes.voltui.dev share it.
 *
 * `localStorage` belongs to one origin, so the two sites cannot read each other's. What they can
 * share is a functional cookie scoped to the parent domain (`Domain=voltui.dev`), which every
 * subdomain receives. The cookie carries only the four official preset choices, in a fixed
 * five-segment string — never CSS, never a Theme Studio draft, never an identifier:
 *
 *     1.sage.brutal.dark.spacious      (version . color . style . mode . density)
 *
 * Everything read back is validated against the presets the library really ships; anything else
 * is treated as absent. This module is plain TypeScript with no Angular, so the switcher, the
 * early bootstrap script's parity test and the unit tests all use the same code.
 *
 * Resolution order (see `resolveThemePrefs`): a valid shared cookie, then the legacy per-origin
 * `localStorage` keys (migration), then the defaults.
 */
export interface ThemePrefs {
  readonly color: VoltThemeColor;
  readonly style: VoltThemeStyle;
  readonly dark: boolean;
  readonly density: VoltThemeDensity;
}

export const DENSITY_PRESETS = [
  'compact',
  'comfortable',
  'spacious',
] as const satisfies readonly VoltThemeDensity[];

export const DEFAULT_THEME_PREFS: ThemePrefs = {
  color: 'volt',
  style: 'sharp',
  dark: false,
  density: 'comfortable',
};

export const THEME_COOKIE_VERSION = '1';
/** `__Secure-` makes browsers refuse the cookie unless it is set over HTTPS. */
export const THEME_COOKIE_NAME = '__Secure-volt-theme';
/** Plain HTTP on localhost cannot set a `Secure` cookie. */
export const THEME_COOKIE_NAME_DEV = 'volt-theme';
export const THEME_COOKIE_DOMAIN = 'voltui.dev';
/** Six months: long enough to feel permanent, short enough to age out. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 183;

/** The legacy, per-origin keys the switcher used before the shared cookie. */
export const LOCAL_KEYS = {
  color: 'volt-color',
  style: 'volt-style',
  dark: 'volt-dark',
  density: 'volt-density',
} as const;

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

export const isColor = (value: unknown): value is VoltThemeColor => includes(COLOR_PRESETS, value);
export const isStyle = (value: unknown): value is VoltThemeStyle => includes(STYLE_PRESETS, value);
export const isDensity = (value: unknown): value is VoltThemeDensity =>
  includes(DENSITY_PRESETS, value);

export function encodeThemePrefs(prefs: ThemePrefs): string {
  return [
    THEME_COOKIE_VERSION,
    prefs.color,
    prefs.style,
    prefs.dark ? 'dark' : 'light',
    prefs.density,
  ].join('.');
}

/** Returns `null` for anything that is not exactly a current, fully valid payload. */
export function decodeThemePrefs(raw: string | null | undefined): ThemePrefs | null {
  if (!raw || raw.length > 64) return null;
  const parts = raw.split('.');
  if (parts.length !== 5 || parts[0] !== THEME_COOKIE_VERSION) return null;
  const [, color, style, mode, density] = parts;
  if (!isColor(color) || !isStyle(style) || !isDensity(density)) return null;
  if (mode !== 'dark' && mode !== 'light') return null;
  return { color, style, dark: mode === 'dark', density };
}

export function themePrefsEqual(a: ThemePrefs, b: ThemePrefs): boolean {
  return a.color === b.color && a.style === b.style && a.dark === b.dark && a.density === b.density;
}

/** Where, and how, the cookie may be written for the page being shown. */
export interface ThemeCookieScope {
  readonly name: string;
  /** Absent means host-only (development). */
  readonly domain?: string;
  readonly secure: boolean;
}

export function themeCookieScope(hostname: string, protocol: string): ThemeCookieScope {
  const host = hostname.toLowerCase();
  const shared = host === THEME_COOKIE_DOMAIN || host.endsWith(`.${THEME_COOKIE_DOMAIN}`);
  if (shared && protocol === 'https:') {
    return { name: THEME_COOKIE_NAME, domain: THEME_COOKIE_DOMAIN, secure: true };
  }
  // localhost, previews and plain HTTP: a host-only cookie. Never attempt Domain=voltui.dev from
  // another host — the browser would reject the whole cookie.
  return { name: THEME_COOKIE_NAME_DEV, secure: protocol === 'https:' };
}

export function serializeThemeCookie(prefs: ThemePrefs, scope: ThemeCookieScope): string {
  return [
    `${scope.name}=${encodeThemePrefs(prefs)}`,
    'Path=/',
    `Max-Age=${THEME_COOKIE_MAX_AGE}`,
    'SameSite=Lax',
    ...(scope.domain ? [`Domain=${scope.domain}`] : []),
    ...(scope.secure ? ['Secure'] : []),
  ].join('; ');
}

export function readCookieValue(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

type CookieDocument = Pick<Document, 'cookie'> & {
  readonly location?: Pick<Location, 'hostname' | 'protocol'>;
};
type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

const scopeOf = (doc: CookieDocument): ThemeCookieScope =>
  themeCookieScope(doc.location?.hostname ?? '', doc.location?.protocol ?? 'http:');

/** The valid shared preference, or `null` when the cookie is missing, malformed or unreadable. */
export function readSharedThemePrefs(doc: CookieDocument): ThemePrefs | null {
  try {
    return decodeThemePrefs(readCookieValue(doc.cookie, scopeOf(doc).name));
  } catch {
    return null;
  }
}

export function writeSharedThemePrefs(doc: CookieDocument, prefs: ThemePrefs): void {
  try {
    doc.cookie = serializeThemeCookie(prefs, scopeOf(doc));
  } catch {
    // Cookies blocked: the page keeps working with local-only preferences.
  }
}

/**
 * The legacy per-origin values. A field that is missing or invalid falls back to its default;
 * `null` means nothing valid was stored at all, so defaults must not be treated as a choice.
 */
export function readLocalThemePrefs(storage: KeyValueStorage | null): ThemePrefs | null {
  if (!storage) return null;
  try {
    const color = storage.getItem(LOCAL_KEYS.color);
    const style = storage.getItem(LOCAL_KEYS.style);
    const dark = storage.getItem(LOCAL_KEYS.dark);
    const density = storage.getItem(LOCAL_KEYS.density);
    const found =
      isColor(color) || isStyle(style) || isDensity(density) || dark === 'true' || dark === 'false';
    if (!found) return null;
    return {
      color: isColor(color) ? color : DEFAULT_THEME_PREFS.color,
      style: isStyle(style) ? style : DEFAULT_THEME_PREFS.style,
      dark: dark === 'true',
      density: isDensity(density) ? density : DEFAULT_THEME_PREFS.density,
    };
  } catch {
    return null;
  }
}

export function writeLocalThemePrefs(storage: KeyValueStorage | null, prefs: ThemePrefs): void {
  if (!storage) return;
  try {
    storage.setItem(LOCAL_KEYS.color, prefs.color);
    storage.setItem(LOCAL_KEYS.style, prefs.style);
    storage.setItem(LOCAL_KEYS.dark, String(prefs.dark));
    storage.setItem(LOCAL_KEYS.density, prefs.density);
  } catch {
    // Storage denied (private mode, blocked site data).
  }
}

export type ThemePrefsSource = 'shared' | 'local' | 'default';

/** The one precedence rule: shared cookie, then migrated local values, then defaults. */
export function resolveThemePrefs(
  shared: ThemePrefs | null,
  local: ThemePrefs | null
): { prefs: ThemePrefs; source: ThemePrefsSource } {
  if (shared) return { prefs: shared, source: 'shared' };
  if (local) return { prefs: local, source: 'local' };
  return { prefs: DEFAULT_THEME_PREFS, source: 'default' };
}

export function safeLocalStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/**
 * Reads the preference for a page. When only the legacy local values exist they are promoted to the
 * shared cookie, so the sibling site picks them up; defaults are never written.
 */
export function loadThemePrefs(
  doc: CookieDocument,
  storage: KeyValueStorage | null
): { prefs: ThemePrefs; source: ThemePrefsSource } {
  const resolved = resolveThemePrefs(readSharedThemePrefs(doc), readLocalThemePrefs(storage));
  if (resolved.source === 'local') writeSharedThemePrefs(doc, resolved.prefs);
  return resolved;
}

/** Persists a choice the visitor just made: the shared cookie first, the local fallback second. */
export function saveThemePrefs(
  doc: CookieDocument,
  storage: KeyValueStorage | null,
  prefs: ThemePrefs
): void {
  writeSharedThemePrefs(doc, prefs);
  writeLocalThemePrefs(storage, prefs);
}
