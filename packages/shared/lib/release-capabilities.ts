/**
 * Capabilities the documentation and the MCP server describe that a consumer may not have yet,
 * because the version that ships them is not on npm.
 *
 * Explicitly maintained, never inferred from the source version: a pending version can accumulate
 * several developments, and only the published artifact says what it contains. Each entry names the
 * first version of its package that ships it (`since`, which may be the pending source version) and
 * a `probe` that `pnpm check:published` runs against the artifact npm serves today:
 *
 *   npm latest >= since   the probe must PASS on the published package ("available")
 *   npm latest <  since   the probe must FAIL on it ("not published yet")
 *
 * so neither claim can silently go stale. Add an entry when a guide, the MCP or a Recipes page
 * starts describing something npm does not have; remove it once every supported version has it.
 *
 * No imports: the sites, the MCP server and Node scripts (type stripping) all load this file.
 */

export type PackageName = '@voltui/components' | '@voltui/cli' | '@voltui/agent';

export type CapabilityProbe =
  /** `volt --help` (the installed CLI) prints this text. */
  | { readonly kind: 'cli-help'; readonly includes: string }
  /** A file of the installed package contains this text, or matches this regular expression. */
  | {
      readonly kind: 'package-file';
      readonly file: string;
      readonly includes?: string;
      readonly pattern?: string;
    }
  /** The installed package's package.json `exports` has this subpath. */
  | { readonly kind: 'package-export'; readonly subpath: string }
  /** A skill the installed agent writes (`volt-ui-agent claude --yes`) contains this text. */
  | { readonly kind: 'agent-skill'; readonly skill: string; readonly includes: string }
  /** The installed package's type declarations export every one of these names. */
  | { readonly kind: 'package-exports'; readonly names: readonly string[] }
  /** `volt add <components>` into an empty directory succeeds with the installed CLI. */
  | { readonly kind: 'cli-add'; readonly components: readonly string[] };

export interface ReleaseCapability {
  readonly id: string;
  readonly package: PackageName;
  /** First version of `package` that ships it. */
  readonly since: string;
  /** One line, English, for agents and reports (the site shows its own translated text). */
  readonly summary: string;
  /** The capability as code (`volt diff`, `--track`): shown as-is in every language. */
  readonly label: string;
  /**
   * Component folders it concerns, for per-component answers (MCP `get_component`). For a
   * `package-exports` probe the owners of the names are used when this is omitted.
   */
  readonly components?: readonly string[];
  readonly probe: CapabilityProbe;
}

export const RELEASE_CAPABILITIES: readonly ReleaseCapability[] = [
  {
    id: 'cli.path',
    label: '--path',
    package: '@voltui/cli',
    since: '1.4.0',
    summary: '`--path=<dir>` names the destination of `volt init` / `volt add` explicitly.',
    probe: { kind: 'cli-help', includes: '--path' },
  },
  {
    id: 'cli.track',
    label: 'volt add --track',
    package: '@voltui/cli',
    since: '1.4.0',
    summary: '`volt add --track` records what was copied in `.volt-ui.json`.',
    probe: { kind: 'cli-help', includes: '--track' },
  },
  {
    id: 'cli.diff',
    label: 'volt diff',
    package: '@voltui/cli',
    since: '1.4.0',
    summary: '`volt diff` compares a customised copy with the CLI reference, read-only.',
    probe: { kind: 'cli-help', includes: 'volt diff' },
  },
  {
    id: 'cli.multi-add',
    label: 'volt add',
    package: '@voltui/cli',
    since: '1.4.0',
    summary:
      'One `volt add` with several components that share a dependency (Sidebar and Tooltip): earlier versions refuse to overwrite the dependency they just copied.',
    probe: { kind: 'cli-add', components: ['tooltip', 'sidebar'] },
  },
  {
    id: 'components.theme-scope',
    label: 'voltTheme',
    package: '@voltui/components',
    since: '1.4.1',
    summary:
      'Scoped themes and persistence: the `[voltTheme]` directive, `voltThemeInherit`, `voltThemeInitScript()` and `persistVoltTheme()`.',
    probe: {
      kind: 'package-exports',
      names: [
        'VoltTheme',
        'VoltThemeInherit',
        'voltThemeInitScript',
        'persistVoltTheme',
        'VOLT_THEME_STORAGE_KEY',
        'VoltThemeColor',
        'VoltThemeDensity',
        'VoltThemeInitScriptOptions',
        'VoltThemeOptions',
        'VoltThemeStyle',
      ],
    },
  },
  {
    id: 'components.exported-types',
    label: 'import type',
    package: '@voltui/components',
    since: '1.4.1',
    summary:
      'Variant and option types exported from the package (`ButtonVariants`, `VoltDialogOptions`, `VoltToastOptions`, …) and the Navigation Menu variant API.',
    probe: {
      kind: 'package-exports',
      names: [
        'AlertRole',
        'AlertVariants',
        'BadgeVariants',
        'ButtonVariants',
        'DrawerSide',
        'ListboxOptionVariants',
        'navigationMenuItemVariants',
        'navigationMenuVariants',
        'VoltNavigationMenuCurrent',
        'VoltNavigationMenuLayout',
        'VoltNavigationMenuVariant',
        'PaginationButtonVariants',
        'SkeletonVariants',
        'SpinnerVariants',
        'TextareaVariants',
        'ToastVariants',
        'VoltToastConfig',
        'VoltToastOptions',
        'VoltToastPlacement',
        'VoltToastRef',
        'VoltToastTemplateOptions',
        'VoltToastVariant',
        'ToggleGroupItemVariants',
        'ToggleVariants',
        'VoltComboboxFilterMode',
        'VoltDatePickerFirstDayOfWeek',
        'VoltDialogContext',
        'VoltDialogOptions',
        'VoltDialogRole',
      ],
    },
  },
  {
    id: 'components.numeric-attribute-strings',
    label: 'rows="4"',
    components: [
      'textarea',
      'slider',
      'range-slider',
      'meter',
      'progress',
      'input-otp',
      'pagination',
    ],
    package: '@voltui/components',
    since: '1.4.1',
    summary:
      'Numeric inputs accept attribute strings in strict templates (`rows="4"`, `max="10"`); earlier versions need a binding (`[rows]="4"`).',
    probe: {
      kind: 'package-file',
      file: 'types/voltui-components.d.ts',
      pattern: 'readonly rows: [\\w.]*InputSignalWithTransform<number, unknown>',
    },
  },
  {
    id: 'components.quartz',
    label: '@voltui/components/quartz',
    components: [
      'accordion',
      'checkbox',
      'listbox',
      'radio',
      'select',
      'switch',
      'tabs',
      'toggle',
      'toggle-group',
    ],
    package: '@voltui/components',
    since: '1.4.1',
    summary: 'The experimental `@voltui/components/quartz` entry point (Quartz Headless backend).',
    probe: { kind: 'package-export', subpath: './quartz' },
  },
  {
    id: 'components.input-describedby',
    label: 'aria-describedby',
    components: ['input', 'textarea'],
    package: '@voltui/components',
    since: '1.4.1',
    summary: 'A consumer `aria-describedby` on Input and Textarea reaches the native control.',
    probe: {
      kind: 'package-file',
      file: 'fesm2022/voltui-components.mjs',
      includes: 'forwardDescribedBy',
    },
  },
  {
    id: 'agent.diff-guidance',
    label: 'volt-ui-distribution',
    package: '@voltui/agent',
    since: '0.6.1',
    summary: 'The installed distribution skill teaches `volt add --track` and `volt diff`.',
    probe: { kind: 'agent-skill', skill: 'volt-ui-distribution', includes: 'volt diff' },
  },
];

export interface PackageRelease {
  /** The version in the repository: the next release, not an installable one. */
  readonly source: string;
  /** npm `latest`, or null when it has never been read. */
  readonly published: string | null;
}

export type CapabilityStatus = 'available' | 'unreleased' | 'unknown';

/** Plain semver comparison for release versions (`1.4.0` vs `1.3.3`); prereleases are not used. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(/[.-]/).map(Number);
  const pb = b.split(/[.-]/).map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) < (pb[i] ?? 0) ? -1 : 1;
  }
  return 0;
}

/**
 * Whether a capability is in what npm serves (`available`), only in the source (`unreleased`), or
 * cannot be told because the registry was never read (`unknown`). With `installed`, the answer is
 * for that version instead of npm latest — what the MCP server does with a consumer's versions.
 */
export function capabilityStatus(
  capability: ReleaseCapability,
  releases: Readonly<Record<PackageName, PackageRelease>>,
  installed?: string | null
): CapabilityStatus {
  const version = installed ?? releases[capability.package]?.published ?? null;
  if (!version) return 'unknown';
  return compareVersions(version, capability.since) >= 0 ? 'available' : 'unreleased';
}

export function capabilityById(id: string): ReleaseCapability {
  const found = RELEASE_CAPABILITIES.find(capability => capability.id === id);
  if (!found) throw new Error(`Unknown release capability "${id}"`);
  return found;
}
