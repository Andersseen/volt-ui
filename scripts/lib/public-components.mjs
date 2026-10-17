import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Public but not a renderable widget: `theme` is a pair of functions, documented under Foundations. */
export const FOUNDATION_ONLY = new Set(['theme']);

/** Every component or layout exported from `public-api.ts`, minus the foundation-only ones. */
export function publicComponents() {
  const src = readFileSync(join(ROOT, 'projects/volt/src/public-api.ts'), 'utf8');
  return [...src.matchAll(/export \* from '\.\/lib\/(?:components|layouts)\/([\w-]+)'/g)]
    .map(m => m[1])
    .filter(name => !FOUNDATION_ONLY.has(name));
}
