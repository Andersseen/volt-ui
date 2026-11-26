/**
 * The two ways a consumer uses Volt UI, and the one transform between them.
 *
 *   package   `@voltui/components`, `Volt*` classes, `volt-*` / `volt*` selectors
 *   copy      `@voltui/cli add`: `Ui*` classes, `ui-*` / `ui*` selectors, imported from the copied
 *             folder (`./ui/<component>`) — the names the CLI itself writes into the copied files
 *
 * Examples are authored once, in package mode, and compiled in both (scripts/check-examples.mjs).
 * The transform renames only names the library declares (`VOLT_NAMES`, generated from the source by
 * scripts/generate-api-reference.mjs), so prose, URLs, CSS custom properties (`--volt-*`), theme
 * preset names (`'volt'`) and unrelated identifiers stay as written.
 *
 * No imports at all: the site, the MCP server and Node scripts (type stripping) all load it, and each
 * passes the generated names in.
 */

export type DistributionMode = 'package' | 'copy';

export interface VoltNames {
  /** Public name → the component folder that exports it (`VoltButton` → `button`). */
  exportOwners: Record<string, string>;
  /** Element selectors, `volt-card`. */
  elements: string[];
  /** Attribute selectors, `voltButton`. */
  attributes: string[];
  /** `exportAs` names. */
  exportAs: string[];
}

export interface Distribution {
  /** Components (CLI folder names) a package-mode source imports, in order of first appearance. */
  componentsUsed(source: string): string[];
  /** Package-mode source → the same file in a CLI-copy project (`uiDir`: path to the copied folder). */
  toCopyMode(source: string, uiDir?: string): string;
  sourceFor(source: string, mode: DistributionMode, uiDir?: string): string;
  /** `npx @voltui/cli add …` for everything a package-mode source imports, or null. */
  cliAddCommand(source: string): string | null;
}

export const PACKAGE_NAME = '@voltui/components';

/** `VoltButton` → `UiButton`, `voltThemeInitScript` → `uiThemeInitScript` (what the CLI writes). */
export function copyName(name: string): string {
  return name
    .replace(/^volt-/, 'ui-')
    .replace(/^Volt(?=[A-Z])/, 'Ui')
    .replace(/^volt(?=[A-Z])/, 'ui');
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const alternation = (names: readonly string[]) =>
  [...names]
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|');

interface ImportedName {
  name: string;
  alias?: string;
  typeOnly: boolean;
}

/** `import { … } from '@voltui/components'` and `export { … } from '@voltui/components'`. */
const PACKAGE_IMPORT_RE =
  /(import|export)\s+(type\s+)?\{([^}]*)\}\s*from\s*(['"])@voltui\/components\4;?[ \t]*\n?/g;

/**
 * Any other reference to the package: a namespace, default or side-effect import, or a dynamic
 * `import()`. The copy has no single module to point those at, so the transform refuses them
 * rather than leaving a `@voltui/components` import in a project that does not install it.
 */
const OTHER_PACKAGE_REFERENCE_RE =
  /(?:\bfrom\s*|\bimport\s*\(?\s*)(['"])@voltui\/components(?:\/[^'"]*)?\1/;

function parseSpecifiers(list: string, typeOnly: boolean): ImportedName[] {
  return list
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const own = part.startsWith('type ');
      const [name, alias] = part
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .map(s => s.trim());
      return { name, alias, typeOnly: typeOnly || own };
    });
}

export function createDistribution(names: VoltNames): Distribution {
  const owners = names.exportOwners;
  // Every name the library declares — element and attribute selectors, `exportAs` names, exported
  // identifiers — as a whole token. `--volt-sidebar-width`, `'volt'` and `volt-ui` never match.
  const tokenRe = new RegExp(
    `(?<![\\w$-])(${alternation([
      ...names.elements,
      ...names.attributes,
      ...names.exportAs,
      ...Object.keys(owners),
    ])})(?![\\w$-])`,
    'g'
  );
  const ownerOf = (name: string) => {
    const owner = owners[name];
    if (!owner) throw new Error(`"${name}" is not exported by any Volt UI component`);
    return owner;
  };

  function componentsUsed(source: string): string[] {
    const folders: string[] = [];
    for (const m of source.matchAll(PACKAGE_IMPORT_RE)) {
      for (const { name } of parseSpecifiers(m[3], !!m[2])) {
        const owner = ownerOf(name);
        if (!folders.includes(owner)) folders.push(owner);
      }
    }
    return folders;
  }

  function toCopyMode(source: string, uiDir = './ui'): string {
    // Imports first, on the original names: one statement per copied component folder.
    const out = source.replace(
      PACKAGE_IMPORT_RE,
      (_match, keyword: 'import' | 'export', typeKeyword: string | undefined, list: string) => {
        const byFolder = new Map<string, ImportedName[]>();
        for (const spec of parseSpecifiers(list, !!typeKeyword)) {
          const owner = ownerOf(spec.name);
          byFolder.set(owner, [...(byFolder.get(owner) ?? []), spec]);
        }
        return [...byFolder]
          .map(([folder, specs]) => {
            const allTypes = specs.every(s => s.typeOnly);
            const list = specs.map(
              s =>
                `${s.typeOnly && !allTypes ? 'type ' : ''}${copyName(s.name)}${s.alias ? ` as ${s.alias}` : ''}`
            );
            return `${keyword} ${allTypes ? 'type ' : ''}{ ${list.join(', ')} } from '${uiDir}/${folder}';\n`;
          })
          .join('');
      }
    );
    const leftover = OTHER_PACKAGE_REFERENCE_RE.exec(out);
    if (leftover) {
      const line = out.slice(0, leftover.index).split('\n').length;
      throw new Error(
        `line ${line}: only named imports and re-exports of @voltui/components can be turned into CLI-copy imports (no namespace, default, side-effect or dynamic import, no deep path)`
      );
    }
    return out.replace(tokenRe, name => copyName(name));
  }

  return {
    componentsUsed,
    toCopyMode,
    sourceFor: (source, mode, uiDir = './ui') =>
      mode === 'copy' ? toCopyMode(source, uiDir) : source,
    cliAddCommand: source => {
      const folders = componentsUsed(source);
      return folders.length ? `npx @voltui/cli add ${folders.join(' ')}` : null;
    },
  };
}
