import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_PREFS,
  decodeThemePrefs,
  encodeThemePrefs,
  loadThemePrefs,
  readCookieValue,
  readLocalThemePrefs,
  resolveThemePrefs,
  saveThemePrefs,
  serializeThemeCookie,
  themeCookieScope,
  type ThemePrefs,
} from './theme-preferences';

const sage: ThemePrefs = { color: 'sage', style: 'brutal', dark: true, density: 'spacious' };
const ember: ThemePrefs = { color: 'ember', style: 'soft', dark: false, density: 'compact' };

const memory = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    data,
  };
};

/** A document whose `cookie` behaves like the real jar for one name, ignoring attributes. */
const fakeDoc = (hostname: string, protocol: string, cookie = '') => {
  const doc = {
    location: { hostname, protocol },
    written: [] as string[],
    _jar: cookie,
    get cookie() {
      return this._jar;
    },
    set cookie(value: string) {
      this.written.push(value);
      this._jar = value.split(';')[0];
    },
  };
  return doc;
};

describe('theme preference cookie', () => {
  it('round-trips every official preset combination', () => {
    expect(decodeThemePrefs(encodeThemePrefs(sage))).toEqual(sage);
    expect(decodeThemePrefs(encodeThemePrefs(ember))).toEqual(ember);
    expect(encodeThemePrefs(sage)).toBe('1.sage.brutal.dark.spacious');
  });

  it.each([
    '',
    'garbage',
    '1.sage.brutal.dark',
    '2.sage.brutal.dark.spacious',
    '1.neon.brutal.dark.spacious',
    '1.sage.round.dark.spacious',
    '1.sage.brutal.dim.spacious',
    '1.sage.brutal.dark.huge',
    '1.sage.brutal.dark.spacious.extra',
    '1.sage.brutal.dark.spacious}; --primary: red',
    `1.${'a'.repeat(100)}`,
  ])('rejects %j', raw => {
    expect(decodeThemePrefs(raw)).toBeNull();
  });

  it('finds the cookie among others, with whitespace', () => {
    expect(readCookieValue('a=1; __Secure-volt-theme=x.y; b=2', '__Secure-volt-theme')).toBe('x.y');
    expect(readCookieValue('a=1', 'volt-theme')).toBeNull();
    expect(readCookieValue('volt-theme-other=1', 'volt-theme')).toBeNull();
  });
});

describe('cookie scope', () => {
  it.each(['voltui.dev', 'recipes.voltui.dev', 'RECIPES.VOLTUI.DEV'])(
    'is domain-wide and secure on https://%s',
    host => {
      const scope = themeCookieScope(host, 'https:');
      expect(scope).toEqual({ name: '__Secure-volt-theme', domain: 'voltui.dev', secure: true });
      const header = serializeThemeCookie(sage, scope);
      expect(header).toContain('Domain=voltui.dev');
      expect(header).toContain('Secure');
      expect(header).toContain('SameSite=Lax');
      expect(header).toContain('Path=/');
      expect(header).toMatch(/Max-Age=\d+/);
    }
  );

  it.each([
    ['localhost', 'http:'],
    ['127.0.0.1', 'http:'],
    ['evilvoltui.dev', 'https:'],
    ['voltui.dev.example.com', 'https:'],
    ['voltui.dev', 'http:'],
  ])('is host-only and never claims voltui.dev on %s %s', (host, protocol) => {
    const scope = themeCookieScope(host, protocol);
    expect(scope.domain).toBeUndefined();
    expect(scope.name).toBe('volt-theme');
    expect(serializeThemeCookie(sage, scope)).not.toContain('Domain=');
  });
});

describe('preference precedence', () => {
  it('prefers the shared cookie over stale local values', () => {
    expect(resolveThemePrefs(sage, ember)).toEqual({ prefs: sage, source: 'shared' });
  });

  it('falls back to local, then to defaults', () => {
    expect(resolveThemePrefs(null, ember)).toEqual({ prefs: ember, source: 'local' });
    expect(resolveThemePrefs(null, null)).toEqual({
      prefs: DEFAULT_THEME_PREFS,
      source: 'default',
    });
  });

  it('reads partial and invalid legacy local values field by field', () => {
    expect(readLocalThemePrefs(memory())).toBeNull();
    expect(readLocalThemePrefs(memory({ 'volt-color': 'neon' }))).toBeNull();
    expect(readLocalThemePrefs(memory({ 'volt-color': 'dusk' }))).toEqual({
      ...DEFAULT_THEME_PREFS,
      color: 'dusk',
    });
    expect(readLocalThemePrefs(null)).toBeNull();
  });

  it('promotes legacy local values to the cookie, but never writes defaults', () => {
    const doc = fakeDoc('recipes.voltui.dev', 'https:');
    loadThemePrefs(doc, memory());
    expect(doc.written).toEqual([]);

    const migrated = loadThemePrefs(doc, memory({ 'volt-color': 'glacier', 'volt-dark': 'true' }));
    expect(migrated.source).toBe('local');
    expect(doc.written).toHaveLength(1);
    expect(doc.written[0]).toContain('1.glacier.sharp.dark.comfortable');
  });

  it('does not touch the cookie when a valid shared value already exists', () => {
    const doc = fakeDoc('voltui.dev', 'https:', '__Secure-volt-theme=1.sage.brutal.dark.spacious');
    const result = loadThemePrefs(doc, memory({ 'volt-color': 'ember' }));
    expect(result).toEqual({ prefs: sage, source: 'shared' });
    expect(doc.written).toEqual([]);
  });

  it('ignores an invalid cookie and uses local values', () => {
    const doc = fakeDoc('voltui.dev', 'https:', '__Secure-volt-theme=1.neon.x');
    expect(loadThemePrefs(doc, memory({ 'volt-color': 'ember' })).source).toBe('local');
  });

  it('survives denied cookies and denied storage', () => {
    const doc = {
      location: { hostname: 'voltui.dev', protocol: 'https:' },
      get cookie(): string {
        throw new Error('denied');
      },
      set cookie(_: string) {
        throw new Error('denied');
      },
    };
    const storage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    };
    expect(loadThemePrefs(doc, storage).source).toBe('default');
    expect(() => saveThemePrefs(doc, storage, sage)).not.toThrow();
  });

  it('saves to both the cookie and the local fallback', () => {
    const doc = fakeDoc('voltui.dev', 'https:');
    const storage = memory();
    saveThemePrefs(doc, storage, sage);
    expect(doc.written[0]).toContain('__Secure-volt-theme=1.sage.brutal.dark.spacious');
    expect(readLocalThemePrefs(storage)).toEqual(sage);
  });
});

/**
 * The early bootstrap in each index.html cannot import this module, so it re-implements the same
 * decision. This runs the real script text against the same inputs and compares the outcome.
 */
describe('index.html early bootstrap parity', () => {
  const scriptOf = (app: 'web' | 'recipes') => {
    const html = readFileSync(resolve(__dirname, `../../../apps/${app}/index.html`), 'utf8');
    const match = html.match(/<script>([\s\S]*?volt-theme[\s\S]*?)<\/script>/);
    if (!match) throw new Error(`no theme bootstrap in ${app}/index.html`);
    return match[1];
  };

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');
    for (const a of ['data-color', 'data-style', 'data-density'])
      document.documentElement.removeAttribute(a);
    document.cookie = 'volt-theme=; Max-Age=0; Path=/';
  });

  const run = (script: string) => {
    new Function(script)();
    const root = document.documentElement;
    return {
      color: root.getAttribute('data-color'),
      style: root.getAttribute('data-style'),
      density: root.getAttribute('data-density'),
      dark: root.classList.contains('dark'),
    };
  };

  it.each(['web', 'recipes'] as const)('%s: applies a valid cookie', app => {
    document.cookie = 'volt-theme=1.sage.brutal.dark.spacious; Path=/';
    expect(run(scriptOf(app))).toEqual({
      color: 'sage',
      style: 'brutal',
      density: 'spacious',
      dark: true,
    });
  });

  it.each(['web', 'recipes'] as const)('%s: cookie beats stale localStorage', app => {
    document.cookie = 'volt-theme=1.ember.soft.light.compact; Path=/';
    localStorage.setItem('volt-color', 'sage');
    localStorage.setItem('volt-dark', 'true');
    expect(run(scriptOf(app))).toMatchObject({ color: 'ember', style: 'soft', dark: false });
  });

  it.each(['web', 'recipes'] as const)('%s: ignores an invalid cookie, migrates local', app => {
    document.cookie = 'volt-theme=1.neon.soft.light.compact; Path=/';
    localStorage.setItem('volt-color', 'dusk');
    expect(run(scriptOf(app))).toMatchObject({ color: 'dusk', style: null, dark: false });
  });

  it.each(['web', 'recipes'] as const)('%s: applies nothing without any preference', app => {
    expect(run(scriptOf(app))).toEqual({ color: null, style: null, density: null, dark: false });
  });
});
