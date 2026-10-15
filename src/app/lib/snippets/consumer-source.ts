/**
 * Blocks and layouts are authored against the docs app's `volt` alias, because that is what
 * resolves inside this repository. A visitor copying one has no such alias, so the source we
 * *show* is rewritten to the package a consumer actually installs. One file feeds both the live
 * preview and the copy button; only the import specifier differs.
 *
 * Plain functions with no Angular or Vite imports, so `scripts/check-copied-source.mjs` can run
 * the exact same transformation under Node.
 */

const PACKAGE = '@voltui/components';

/** `from 'volt'` → `from '@voltui/components'`, for static and dynamic imports alike. */
export function toConsumerSource(raw: string): string {
  return raw.replace(/(from\s+|import\(\s*)(['"])volt\2/g, `$1$2${PACKAGE}$2`);
}

/** Module specifiers a source imports, in order of appearance. */
export function importSpecifiers(source: string): string[] {
  return [...source.matchAll(/(?:from\s+|import\(\s*|import\s+)(['"])([^'"]+)\1/g)].map(m => m[2]);
}

/**
 * npm packages a source needs, beyond Angular itself. Derived from the source so a block that
 * starts importing a new library cannot forget to say so.
 */
export function externalPackages(source: string): string[] {
  const packages = new Set<string>();
  for (const specifier of importSpecifiers(source)) {
    if (specifier.startsWith('.') || specifier.startsWith('@angular/')) continue;
    const parts = specifier.split('/');
    packages.add(specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]);
  }
  return [...packages];
}
