import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * A token nothing reads is how the presets ended up declaring six controls with no effect. Every
 * shape token must have a reader in the library or in the Tailwind mapping, and every style has to
 * set the whole list: a style that forgets one would silently inherit Sharp's value.
 */
const lib = dirname(fileURLToPath(import.meta.url));
const themes = join(lib, '../themes');
const read = (file: string) => readFileSync(join(themes, file), 'utf8');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [path] : [];
  });
}

const tokens = read('tokens.css');
const sharpBlock = tokens.slice(tokens.indexOf("[data-volt-theme][data-style='sharp']"));
const declared = (css: string) =>
  [...css.slice(0, css.indexOf('}')).matchAll(/^\s*(--[\w-]+):/gm)].map(match => match[1]);

const SHAPE_TOKENS = declared(sharpBlock);
const STYLE_FILES = ['soft', 'brutal', 'ghost', 'retro'];
/** Declared for compatibility, deprecated: see docs/theme-contract.md. */
const NO_READER = ['--border-style'];

describe('theme tokens', () => {
  it('finds the contract', () => {
    expect(SHAPE_TOKENS).toContain('--radius');
    expect(SHAPE_TOKENS).toContain('--volt-control-border-width');
  });

  it.each(STYLE_FILES)('%s sets every shape token', style => {
    const css = read(`styles/${style}.css`);
    const set = new Set(declared(css.slice(css.indexOf('{'))));
    expect(SHAPE_TOKENS.filter(token => !set.has(token))).toEqual([]);
  });

  it('gives every shape token a reader', () => {
    const library = sourceFiles(lib)
      .map(file => readFileSync(file, 'utf8'))
      .join('\n');
    const mapping = tokens.slice(tokens.indexOf('@theme inline'), tokens.indexOf(':root,'));
    const unread = SHAPE_TOKENS.filter(
      token =>
        !NO_READER.includes(token) && !library.includes(token) && !mapping.includes(`var(${token}`)
    );
    expect(unread).toEqual([]);
  });

  it.each(['core', ...STYLE_FILES])('%s never sets a shadow to none', name => {
    const css = name === 'core' ? tokens : read(`styles/${name}.css`);
    expect(css).not.toMatch(/--volt-shadow[\w-]*:\s*none/);
  });

  it('keeps the radius a length in every style', () => {
    for (const style of STYLE_FILES) {
      expect(read(`styles/${style}.css`)).toMatch(/--radius: [\d.]+(rem|px);/);
    }
  });
});
