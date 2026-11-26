/**
 * Checks for the source a Recipes page hands a visitor, shared by scripts/check-copied-source.mjs and
 * its tests (scripts/copied-source.spec.mjs). Pure functions over strings and file lists.
 */

/** Module specifiers a source imports or re-exports. */
export function specifiers(source) {
  return [
    ...source.matchAll(
      /(?:^|\n)[ \t]*(?:import|export)\b(?:[^;'"]*?\bfrom\b)?\s*(['"])([^'"]+)\1|\bimport\(\s*(['"])([^'"]+)\3/g
    ),
  ].map(m => m[2] ?? m[4]);
}

/**
 * What is wrong with one file of a composition in a mode. `copied` is the list of component folders
 * the CLI copied (copy mode); `siblings` the files shipped beside it; `libraryNames` every export and
 * selector the package declares.
 */
export function sourceProblems({
  file,
  source,
  mode,
  uiDir = '../ui',
  copied = [],
  siblings = [],
  libraryNames = new Set(),
}) {
  const problems = [];
  for (const spec of specifiers(source)) {
    if (spec === 'volt') problems.push(`${file}: imports the monorepo alias 'volt'`);
    else if (spec.startsWith('@shared') || /(^|\/)apps\//.test(spec)) {
      problems.push(`${file}: imports "${spec}", which belongs to the Volt UI websites`);
    } else if (spec.startsWith(`${uiDir}/`)) {
      if (mode !== 'copy') problems.push(`${file}: imports the copy folder "${spec}" in package mode`);
      else {
        const folder = spec.slice(uiDir.length + 1).split('/')[0];
        if (!copied.includes(folder)) {
          problems.push(`${file}: imports "${spec}", but the install command does not copy "${folder}"`);
        }
      }
    } else if (spec.startsWith('./')) {
      if (!siblings.includes(`${spec.slice(2)}.ts`)) {
        problems.push(`${file}: imports "${spec}", which is not shipped beside it`);
      }
    } else if (spec.startsWith('.')) {
      problems.push(`${file}: relative import "${spec}" leaves the composition folder`);
    } else if (mode === 'copy' && spec.startsWith('@voltui/components')) {
      problems.push(`${file}: still imports @voltui/components in CLI-copy mode`);
    }
  }
  if (mode === 'copy') {
    // Only names the library declares: prose such as "there is no VoltDataTable" is not one.
    const leftover = [...source.matchAll(/\b(Volt[A-Z]\w*|volt-[a-z][a-z-]*)\b/g)]
      .map(m => m[1])
      .find(name => libraryNames.has(name));
    if (leftover) problems.push(`${file}: CLI-copy source still uses the package name "${leftover}"`);
  }
  return problems;
}
