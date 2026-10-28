import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = join(ROOT, 'packages/volt/src/lib');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

/**
 * Every selector the library declares, per component directory, in the package's own names
 * (`volt-card`, `button[voltButton]`).
 * @returns {Map<string, string[]>}
 */
export function librarySelectors() {
  const result = new Map();
  for (const file of walk(join(LIB, 'components')).concat(walk(join(LIB, 'layouts')))) {
    const src = readFileSync(file, 'utf8');
    const dir = file.split('/').slice(-2, -1)[0];
    for (const m of src.matchAll(/^\s*selector:\s*(?:'([^']+)'|"([^"]+)"|`([^`]+)`)/gm)) {
      const list = (m[1] ?? m[2] ?? m[3]).split(',').map(s => s.trim());
      result.set(dir, [...(result.get(dir) ?? []), ...list]);
    }
  }
  return result;
}

/** The names an author may write in a template: elements and attribute directives. */
export function templateNames(selectors = librarySelectors()) {
  const elements = new Set();
  const attributes = new Set();
  for (const list of selectors.values()) {
    for (const sel of list) {
      const el = sel.match(/^([a-z][a-z0-9-]*)(?=\[|$)/)?.[1];
      if (el && el.startsWith('volt-')) elements.add(el);
      for (const a of sel.matchAll(/\[([A-Za-z]\w*)/g)) attributes.add(a[1]);
    }
  }
  return { elements, attributes };
}

/** Every class and function exported from the public API (what `@voltui/components` can import). */
export function publicExports() {
  const api = readFileSync(join(ROOT, 'packages/volt/src/public-api.ts'), 'utf8');
  const names = new Set();
  const visit = (file, seen = new Set()) => {
    if (seen.has(file)) return;
    seen.add(file);
    let src;
    try {
      src = readFileSync(file, 'utf8');
    } catch {
      try {
        src = readFileSync(join(file, 'index.ts'), 'utf8');
        file = join(file, 'index.ts');
      } catch {
        return;
      }
    }
    for (const m of src.matchAll(
      /export\s+(?:abstract\s+)?(?:class|const|function|interface|type|enum)\s+(\w+)/g
    )) {
      names.add(m[1]);
    }
    for (const m of src.matchAll(/export\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)) {
      for (const n of m[1].split(','))
        names.add(
          n
            .trim()
            .split(/\s+as\s+/)
            .pop()
        );
    }
    for (const m of src.matchAll(/export\s*\*\s*from\s*'(\.[^']+)'/g)) {
      const base = file.endsWith('index.ts') ? dirname(file) : dirname(file);
      const target = join(base, m[1]);
      visit(target.endsWith('.ts') ? target : target + '.ts', seen);
      visit(target, seen);
    }
  };
  visit(join(LIB, '..', 'public-api.ts'));
  void api;
  return names;
}
