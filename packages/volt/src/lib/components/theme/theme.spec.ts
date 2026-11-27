import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import {
  applyVoltTheme,
  persistVoltTheme,
  provideVoltTheme,
  voltCustomColor,
  voltCustomStyle,
  voltThemeInitScript,
  VOLT_THEME_STORAGE_KEY,
} from './theme';

function createTestDocument(): Document {
  return document.implementation.createHTMLDocument('test');
}

describe('applyVoltTheme', () => {
  it('sets the data-color attribute', () => {
    const doc = createTestDocument();

    applyVoltTheme({ color: 'ember' }, doc);

    expect(doc.documentElement.getAttribute('data-color')).toBe('ember');
  });

  it('sets the data-style attribute', () => {
    const doc = createTestDocument();

    applyVoltTheme({ style: 'brutal' }, doc);

    expect(doc.documentElement.getAttribute('data-style')).toBe('brutal');
  });

  it('adds the dark class and sets color-scheme to dark', () => {
    const doc = createTestDocument();

    applyVoltTheme({ dark: true }, doc);

    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    expect(doc.documentElement.style.colorScheme).toBe('dark');
  });

  it('removes the dark class and sets color-scheme to light', () => {
    const doc = createTestDocument();
    doc.documentElement.classList.add('dark');

    applyVoltTheme({ dark: false }, doc);

    expect(doc.documentElement.classList.contains('dark')).toBe(false);
    expect(doc.documentElement.style.colorScheme).toBe('light');
  });

  it('leaves unrelated attributes untouched when an option is omitted', () => {
    const doc = createTestDocument();
    doc.documentElement.setAttribute('data-color', 'sage');

    applyVoltTheme({ style: 'ghost' }, doc);

    expect(doc.documentElement.getAttribute('data-color')).toBe('sage');
    expect(doc.documentElement.getAttribute('data-style')).toBe('ghost');
  });

  it('falls back to the global document when passed a falsy document', () => {
    expect(() => applyVoltTheme({ dark: true }, null as unknown as Document)).not.toThrow();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-color');
    document.documentElement.removeAttribute('data-style');
  });
});

describe('provideVoltTheme', () => {
  it('applies the theme to the injected DOCUMENT, not the global document', () => {
    // Regression test for the SSR flash bug: platform-server injects its own
    // Document implementation distinct from the global `document` (which is
    // undefined on the server). Overriding DOCUMENT here with a document
    // that is provably NOT globalThis.document reproduces that shape — if
    // provideVoltTheme ever goes back to reading the global `document`
    // instead of `inject(DOCUMENT)`, this fails because `ssrDoc` stays
    // untouched while the real `document` (asserted absent here) would have
    // been the one mutated.
    const ssrDoc = createTestDocument();
    expect(ssrDoc).not.toBe(document);

    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: ssrDoc },
        provideVoltTheme({ color: 'ember', style: 'brutal', dark: true }),
      ],
    });
    TestBed.inject(DOCUMENT);

    expect(ssrDoc.documentElement.getAttribute('data-color')).toBe('ember');
    expect(ssrDoc.documentElement.getAttribute('data-style')).toBe('brutal');
    expect(ssrDoc.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-color')).not.toBe('ember');
  });
});

describe('voltThemeInitScript', () => {
  const root = document.documentElement;
  const run = (script: string) => new Function(script)();
  const darkSystem = (matches: boolean) =>
    vi.spyOn(window, 'matchMedia').mockImplementation(
      query =>
        ({
          matches: matches && query.includes('dark'),
          media: query,
        }) as unknown as MediaQueryList
    );

  beforeEach(() => {
    localStorage.clear();
    root.removeAttribute('data-color');
    root.removeAttribute('data-style');
    root.removeAttribute('data-density');
    root.classList.remove('dark');
    root.style.colorScheme = '';
  });
  afterEach(() => vi.restoreAllMocks());

  it('applies what persistVoltTheme stored, before Angular runs', () => {
    persistVoltTheme({ color: 'ember', style: 'soft', dark: true });
    root.removeAttribute('data-color');
    root.classList.remove('dark');

    run(voltThemeInitScript());

    expect(root).toHaveAttribute('data-color', 'ember');
    expect(root).toHaveAttribute('data-style', 'soft');
    expect(root).toHaveClass('dark');
    expect(root.style.colorScheme).toBe('dark');
  });

  it('merges a later choice over the stored one', () => {
    persistVoltTheme({ color: 'sage', dark: true });
    persistVoltTheme({ dark: false });
    expect(JSON.parse(localStorage.getItem(VOLT_THEME_STORAGE_KEY)!)).toEqual({
      color: 'sage',
      dark: false,
    });
  });

  it('follows the system colour scheme until the visitor picks one, then the defaults', () => {
    darkSystem(true);
    run(voltThemeInitScript({ defaults: { color: 'dusk' } }));
    expect(root).toHaveClass('dark');
    expect(root).toHaveAttribute('data-color', 'dusk');

    localStorage.setItem(VOLT_THEME_STORAGE_KEY, JSON.stringify({ dark: false }));
    run(voltThemeInitScript());
    expect(root).not.toHaveClass('dark');
  });

  it('ignores tampered values and a custom key it was not given', () => {
    localStorage.setItem(
      'my-theme',
      JSON.stringify({ color: '"><script>', style: 'retro', dark: 'yes' })
    );
    darkSystem(false);
    run(voltThemeInitScript({ storageKey: 'my-theme', followSystem: false }));
    expect(root).not.toHaveAttribute('data-color');
    expect(root).toHaveAttribute('data-style', 'retro');
    expect(root).not.toHaveClass('dark');
    expect(root.style.colorScheme).toBe('');
  });

  it('survives corrupt storage and keeps a hostile key inside the script', () => {
    localStorage.setItem(VOLT_THEME_STORAGE_KEY, '{not json');
    expect(() => run(voltThemeInitScript({ defaults: { style: 'sharp' } }))).not.toThrow();
    expect(root).toHaveAttribute('data-style', 'sharp');

    const script = voltThemeInitScript({ storageKey: '</script><script>alert(1)</script>' });
    expect(script).not.toContain('</script>');
    expect(() => run(script)).not.toThrow();
  });
});

describe('custom themes', () => {
  const root = document.documentElement;
  const run = (script: string) => new Function(script)();
  const acme = voltCustomColor('acme');
  const pebble = voltCustomStyle('pebble');

  beforeEach(() => {
    localStorage.clear();
    root.removeAttribute('data-color');
    root.removeAttribute('data-style');
    root.classList.remove('dark');
  });

  it('declares only safe names that do not collide with a shipped preset', () => {
    expect(voltCustomColor('northern-lights-2')).toBe('northern-lights-2');
    for (const bad of [
      '',
      'Acme',
      '1acme',
      'acme-',
      'a--b',
      "a'] , body{",
      'a b',
      'x'.repeat(49),
    ]) {
      expect(() => voltCustomColor(bad), bad).toThrow(/not a valid custom color/);
    }
    expect(() => voltCustomColor('ember')).toThrow(/shipped color/);
    expect(() => voltCustomStyle('brutal')).toThrow(/shipped style/);
  });

  it('applies a declared palette and style like a shipped one', () => {
    const doc = createTestDocument();
    applyVoltTheme({ color: acme, style: pebble, dark: true }, doc);
    expect(doc.documentElement.getAttribute('data-color')).toBe('acme');
    expect(doc.documentElement.getAttribute('data-style')).toBe('pebble');
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
  });

  it('drops a malformed name that bypassed the type instead of writing it', () => {
    const doc = createTestDocument();
    doc.documentElement.setAttribute('data-color', 'sage');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    applyVoltTheme({ color: "a'] , body{" as never }, doc);
    expect(doc.documentElement.getAttribute('data-color')).toBe('sage');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('never stores a malformed name', () => {
    persistVoltTheme({ color: '"><script>' as never, style: pebble });
    expect(JSON.parse(localStorage.getItem(VOLT_THEME_STORAGE_KEY)!)).toEqual({ style: 'pebble' });
  });

  it('restores a stored custom palette before first paint when the script allows it', () => {
    persistVoltTheme({ color: acme, style: pebble, dark: true });
    root.removeAttribute('data-color');
    root.removeAttribute('data-style');

    run(voltThemeInitScript({ customColors: [acme], customStyles: [pebble] }));

    expect(root).toHaveAttribute('data-color', 'acme');
    expect(root).toHaveAttribute('data-style', 'pebble');
    expect(root).toHaveClass('dark');
  });

  it('accepts a custom default palette that is declared', () => {
    run(voltThemeInitScript({ defaults: { color: acme }, customColors: [acme] }));
    expect(root).toHaveAttribute('data-color', 'acme');
  });

  it('falls back to the defaults for a stored name nobody declared', () => {
    localStorage.setItem(VOLT_THEME_STORAGE_KEY, JSON.stringify({ color: 'stranger' }));
    run(voltThemeInitScript({ defaults: { color: 'sage' }, customColors: [acme] }));
    expect(root).toHaveAttribute('data-color', 'sage');
  });

  it('refuses to build a script around an undeclared or malformed custom name', () => {
    expect(() => voltThemeInitScript({ customColors: ['</script>' as never] })).toThrow();
    expect(() => voltThemeInitScript({ customColors: ['volt' as never] })).toThrow();
  });
});
