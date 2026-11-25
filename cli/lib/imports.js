// Module specifiers of a TypeScript source, shared by the manifest generator (which records what
// every component needs) and the CLI (which derives what one `volt add` needs from the files it
// actually copies). `import type` counts: the consumer's compiler must resolve it too.

/** `@scope/pkg/deep` → `@scope/pkg`, `pkg/deep` → `pkg`. */
function packageName(specifier) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** Package names of the bare (npm) specifiers a source imports or re-exports. */
function bareImports(source) {
  const found = new Set();
  for (const m of source.matchAll(
    /(?:^|\n)\s*(?:import|export)\b[^;'"]*?\bfrom\s*(['"])([^'"]+)\1|(?:^|\n)\s*import\s*(['"])([^'"]+)\3/g
  )) {
    const spec = m[2] ?? m[4];
    if (!spec.startsWith('.') && !spec.startsWith('node:')) found.add(packageName(spec));
  }
  return found;
}

/** Provided by the Angular application itself; Volt never installs these. */
const isFrameworkPackage = pkg => pkg.startsWith('@angular/') || pkg === 'rxjs' || pkg === 'tslib';

module.exports = { packageName, bareImports, isFrameworkPackage };
