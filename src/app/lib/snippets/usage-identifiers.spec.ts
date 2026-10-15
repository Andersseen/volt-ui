import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as usage from './usage';

/**
 * A usage example that imports a symbol the package does not export is documentation that
 * fails the moment someone pastes it. Every `Volt*` identifier written in a usage snippet must
 * be a real export of the library.
 */
const LIB = join(process.cwd(), 'projects/volt/src');

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sources(path);
    return path.endsWith('.ts') && !path.endsWith('.spec.ts') ? [path] : [];
  });
}

const EXPORTED = new Set(
  sources(LIB).flatMap(file =>
    [
      ...readFileSync(file, 'utf8').matchAll(
        /export\s+(?:abstract\s+)?(?:class|const|function|interface|type|enum)\s+(Volt\w+|volt\w+)/g
      ),
    ].map(match => match[1])
  )
);

describe('usage snippets only reference exported Volt symbols', () => {
  it('has found the library exports', () => {
    expect(EXPORTED.has('VoltButton')).toBe(true);
    expect(EXPORTED.size).toBeGreaterThan(100);
  });

  it.each(Object.entries(usage))('%s', (_name, snippet) => {
    // `<volt-…>` tags and `voltFoo` attributes are selectors; only identifiers are exports.
    const identifiers = new Set(String(snippet).match(/\bVolt[A-Z]\w*/g) ?? []);
    const missing = [...identifiers].filter(id => !EXPORTED.has(id));
    expect(missing, `${_name} references symbols the library does not export`).toEqual([]);
  });
});
