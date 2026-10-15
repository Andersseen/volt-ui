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

/**
 * Module specifiers a source imports, in order of appearance. Anchored to statement starts so
 * the word "from" in a comment or a string is not mistaken for an import.
 */
export function importSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const statement =
    /(?:^|\n)[ \t]*(?:import|export)\b(?:[^;'"]*?\bfrom\b)?\s*(['"])([^'"]+)\1|\bimport\(\s*(['"])([^'"]+)\3/g;
  for (const m of source.matchAll(statement)) specifiers.push(m[2] ?? m[4]);
  return specifiers;
}

/** `@scope/pkg/deep` → `@scope/pkg`, `pkg/deep` → `pkg`. */
export function packageName(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/**
 * npm packages a source needs, beyond Angular itself. Derived from the source so a block that
 * starts importing a new library cannot forget to say so.
 */
export function externalPackages(source: string): string[] {
  const packages = new Set<string>();
  for (const specifier of importSpecifiers(source)) {
    if (specifier.startsWith('.') || specifier.startsWith('@angular/')) continue;
    packages.add(packageName(specifier));
  }
  return [...packages];
}
