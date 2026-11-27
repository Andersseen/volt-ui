/**
 * Volt UI MCP Server — spec-compliant Streamable HTTP transport
 *
 * Built with the official MCP TypeScript SDK so AI assistants can query
 * Volt UI components, resources, and prompts over HTTP.
 *
 * Supported clients: Claude Desktop, Cursor, Windsurf, GitHub Copilot, etc.
 *
 * Endpoint: https://voltui.dev/api/mcp
 * Setup:    npx @voltui/agent
 */

import {
  defineEventHandler,
  getMethod,
  getRequestHeader,
  sendWebResponse,
  setHeaders,
  toWebRequest,
} from 'h3';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import {
  ANGULAR_SUPPORT,
  LIBRARY_VERSION,
  RESPONSIBILITIES,
} from './mcp/responsibilities.generated';
import { COMPONENT_API, type McpComponentApi } from './mcp/api.generated';
import { EDITORIAL, type McpCodeExample } from './mcp/editorial';
import * as USAGE from '../../app/lib/snippets/usage';
import { createDistribution } from '../../../../../packages/shared/lib/distribution';
import { VOLT_NAMES } from '../../../../../packages/shared/lib/volt-names.generated';
import {
  capabilityById,
  RELEASE_CAPABILITIES,
} from '../../../../../packages/shared/lib/release-capabilities';
import {
  buildCliCommand,
  capabilityReport,
  isPlainVersion,
  versionContext,
  type ConsumerVersions,
} from './mcp/consumer-context';
import { findCompositions } from './mcp/compositions';

// ---------------------------------------------------------------------------
// Component metadata (inlined — CF Workers have no filesystem access)
//
// Nothing technical is written here. Each fact comes from the place that owns it:
//   selectors, exports, inputs, outputs, variants, npm packages   mcp/api.generated.ts (library source)
//   what a component is for, category, status                     mcp/responsibilities.generated.ts
//   description and template/code examples                        mcp/editorial.ts (compiled by
//                                                                 scripts/check-examples.mjs)
//   the complete usage example                                    app/lib/snippets/usage.ts (compiled
//                                                                 in package and CLI-copy mode)
// Everything is held in the package's names and renamed for CLI-copy projects by the same
// transform the docs site uses (packages/shared/lib/distribution.ts).
// ---------------------------------------------------------------------------

interface InputDef {
  name: string;
  type: string;
  default?: unknown;
  required?: boolean;
  options?: string[];
}

interface ComponentMeta {
  name: string;
  description: string;
  /** npm packages a CLI copy imports (kept as `dependencies` for existing clients). */
  dependencies: string[];
  packages: string[];
  componentDependencies: string[];
  backends: string[];
  /** Classes and functions to import. */
  imports: string[];
  selectors: string[];
  /** Kept for existing clients: the selectors besides the component's own. */
  subComponents: string[];
  /** The main directive's inputs, with variant options where a variant group matches. */
  inputs: InputDef[];
  directives: McpComponentApi['directives'];
  variantGroups: McpComponentApi['variants'];
  /** Options of the `variant` / `size` groups, kept for existing clients. */
  variants?: string[];
  sizes?: string[];
  formControl: boolean;
  examples: string[];
  code?: McpCodeExample[];
}

const distribution = createDistribution(VOLT_NAMES);

const USAGE_SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(USAGE).flatMap(([name, source]) =>
    typeof source === 'string' && name.endsWith('_USAGE') && /@Component\(/.test(source)
      ? [[name.slice(0, -'_USAGE'.length).toLowerCase().replace(/_/g, '-'), source]]
      : []
  )
);

function pascal(key: string): string {
  return key.replace(/(^|-)([a-z])/g, (_m, _d, c: string) => c.toUpperCase());
}

function buildComponent(key: string, api: McpComponentApi): ComponentMeta {
  const editorial = EDITORIAL[key] ?? { description: '', examples: [] };
  const groups = api.variants.flatMap(v => v.groups);
  const optionsOf = (name: string) => groups.find(g => g.name === name)?.options;
  const main =
    api.directives.find(d => d.className === `Volt${pascal(key)}`) ??
    api.directives.find(d => d.inputs.length > 0) ??
    api.directives[0];
  return {
    name: RESPONSIBILITIES[key]?.title ?? pascal(key),
    description: editorial.description,
    dependencies: api.packages,
    packages: api.packages,
    componentDependencies: api.componentDependencies,
    backends: api.backends,
    imports: api.imports,
    selectors: api.selectors,
    subComponents: api.selectors.filter(sel => sel !== main?.selector),
    inputs: (main?.inputs ?? []).map(input => {
      const options = optionsOf(input.name);
      return { ...input, ...(options ? { options } : {}) };
    }),
    directives: api.directives,
    variantGroups: api.variants,
    ...(optionsOf('variant') ? { variants: optionsOf('variant') } : {}),
    ...(optionsOf('size') ? { sizes: optionsOf('size') } : {}),
    formControl: api.formControl,
    examples: editorial.examples,
    ...(editorial.code ? { code: editorial.code } : {}),
  };
}

const components: Record<string, ComponentMeta> = Object.fromEntries(
  Object.entries(COMPONENT_API).map(([key, api]) => [key, buildComponent(key, api)])
);

const componentKeys = Object.keys(components);

// ---------------------------------------------------------------------------
// Shared data helpers
// ---------------------------------------------------------------------------

const overlayComponents = new Set(['dialog', 'drawer', 'popover', 'tooltip', 'dropdown-menu']);
// Components that implement ControlValueAccessor, read from the source (api.generated.ts).
const cvaComponents = new Set(componentKeys.filter(key => components[key].formControl));

function buildSystemContext(): string {
  const componentList = Object.entries(components)
    .map(([key, comp]) => `- ${key} (${comp.name})`)
    .join('\n');

  return [
    'You are an expert Angular assistant working with Volt UI.',
    '',
    '## Project context',
    '',
    `- Volt UI is an Angular component library (Angular ${ANGULAR_SUPPORT}) inspired by shadcn/ui and built on top of ng-primitives.`,
    '- Components are standalone, use OnPush change detection, and prefer signals (`input()`, `output()`, `model()`, `computed()`).',
    '- Styling uses Tailwind CSS v4 with semantic tokens such as `bg-primary`, `text-foreground`, `rounded-md`, `shadow-sm`.',
    '- Variant logic uses class-variance-authority (CVA).',
    '- Components are typically copied into the project via the CLI (`npx @voltui/cli`) and become editable local code.',
    '',
    '## Installation',
    '',
    '### CLI / source-ownership workflow (recommended)',
    '',
    '```bash',
    'npx @voltui/cli init                    # creates src/app/ui',
    'npx @voltui/cli add button card input',
    'npx @voltui/cli add dialog --path=./src/app/shared/ui --dry-run',
    '```',
    '',
    'After copying, import from the local UI folder:',
    '',
    '```ts',
    "import { UiButton } from './ui/button';",
    "import { UiCard, UiCardContent, UiCardHeader } from './ui/card';",
    '```',
    '',
    '### NPM package workflow',
    '',
    '```bash',
    'npm install @voltui/components',
    '```',
    '',
    '```css',
    "@import 'tailwindcss';",
    "@import '@voltui/components/themes.css';",
    '```',
    '',
    "Keep the full `@import 'tailwindcss'`: it includes preflight, the reset the components are styled on. Importing only `tailwindcss/theme.css` + `utilities.css` leaves native buttons, links and inputs with browser defaults.",
    '',
    '```ts',
    "import { provideVoltTheme } from '@voltui/components';",
    '',
    'bootstrapApplication(AppComponent, {',
    "  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],",
    '});',
    '```',
    '',
    'Copied components need only the npm packages their files import (`get_component` lists them as `packages`). `volt add` prints the exact command with the ranges Volt UI was tested with, and `--install` runs it once in the right package, keeping compatible versions already installed and never upgrading Angular.',
    '',
    '## Naming conventions',
    '',
    '| Context | Selector | Class name | Import path |',
    '|---------|----------|------------|-------------|',
    "| Library source | `volt-*` / `[voltXxx]` | `VoltXxx` | `'volt'` / `'@voltui/components'` |",
    "| After CLI copy | `ui-*` / `[uiXxx]` | `UiXxx` | `'./ui/<component>'` |",
    '',
    'When generating code for a consumer project, always use the CLI prefix (`ui-*` / `UiXxx`).',
    '',
    '## Theme system',
    '',
    'Color presets: `volt`, `ember`, `sage`, `dusk`, `glacier`.',
    'Style presets: `sharp`, `soft`, `brutal`, `ghost`, `retro`.',
    '',
    '```ts',
    "provideVoltTheme({ color: 'ember', style: 'soft', dark: false });",
    "applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true });",
    '```',
    '',
    'Components use semantic Tailwind utilities; do not write `bg-[var(--primary)]`.',
    '',
    '## Component catalog',
    '',
    componentList,
    '',
    '## Rules for generating Volt UI code',
    '',
    '1. Prefer standalone components with signal inputs; avoid NgModules.',
    '2. Use OnPush change detection in new components that extend Volt UI.',
    "3. Import copied components from `'./ui/<component>'` (or the local barrel), not from `'volt'`.",
    '4. Use semantic Tailwind utilities (`bg-primary`, `text-foreground`, `rounded-md`) instead of hard-coded `var()` utilities.',
    '5. Boolean inputs must use `booleanAttribute`; number inputs should use `numberAttribute` when appropriate.',
    '6. For overlays, always use the attribute-directive trigger + `<ng-template>` pattern.',
    '7. Do not invent inputs. If unsure, check the source file under `packages/volt/src/lib/components/<name>/` or call the MCP `get_component` tool.',
    '8. Do not invent selectors such as `<ui-dialog>` or `<ui-tooltip>`; overlays are directives, not elements.',
    '',
    '## Overlay pattern',
    '',
    'Overlays (dialog, drawer, popover, tooltip, dropdown-menu) are attribute directives applied to a trigger element. The content lives in an `<ng-template>` that receives a `close` context.',
    '',
    '```html',
    '<button [uiDialog]="dialogTpl">Open</button>',
    '<ng-template #dialogTpl let-close="close">',
    '  <div uiDialogOverlay></div>',
    '  <div uiDialogContent>',
    '    <h2 uiDialogTitle>Title</h2>',
    '    <p uiDialogDescription>Description</p>',
    '    <ui-button (click)="close()">Confirm</ui-button>',
    '  </div>',
    '</ng-template>',
    '```',
    '',
    '## Reactive Forms',
    '',
    'CVA components (checkbox, input, radio, select, switch, textarea, slider, toggle, etc.) work with `formControlName` or `[(ngModel)]`. Make sure the consumer imports `ReactiveFormsModule`.',
    '',
    '## Troubleshooting checklist',
    '',
    '- **Class not found**: the component was not copied. Run `npx @voltui/cli add <name>`.',
    '- **Overlay does not open**: verify the trigger uses the attribute selector and references an `<ng-template>`.',
    '- **Form value not updating**: ensure the component is a CVA component and `ReactiveFormsModule` is imported.',
    '- **Styles missing**: import `@voltui/components/themes.css` after Tailwind.',
    '- **Dark mode not working**: `provideVoltTheme` toggles the `.dark` class; Tailwind `dark:` variant follows it.',
  ].join('\n');
}

const projectInfo = {
  name: 'Volt UI',
  type: 'angular-component-library',
  // What every answer of this server describes. An installed @voltui/components older than this may
  // lack an input or option listed here: compare with the project's package.json before using it.
  describesVersion: LIBRARY_VERSION,
  framework: `Angular ${ANGULAR_SUPPORT}`,
  primitives: 'ng-primitives',
  styling: 'Tailwind CSS v4',
  docs: 'https://voltui.dev',
  packages: {
    components: '@voltui/components',
    cli: '@voltui/cli',
    agent: '@voltui/agent',
  },
  install: {
    npm: 'npm install @voltui/components',
    cli: 'npx @voltui/cli init',
    agent: 'npx @voltui/agent',
  },
  architecture: {
    components: 'standalone',
    changeDetection: 'zoneless-signals',
    hostDirectives: true,
  },
  naming: {
    sourcePrefix: 'volt',
    cliPrefix: 'ui',
    sourceClassPrefix: 'Volt',
    cliClassPrefix: 'Ui',
  },
  compositions:
    'Blocks, layouts and workflow patterns to copy from https://recipes.voltui.dev: use find_compositions before building a page section, shell or workflow by hand.',
};

const themeInfo = {
  colors: ['volt', 'ember', 'sage', 'dusk', 'glacier'],
  styles: ['sharp', 'soft', 'brutal', 'ghost', 'retro'],
  provider: 'provideVoltTheme',
  dynamic: 'applyVoltTheme',
  import: `import { provideVoltTheme, applyVoltTheme } from '@voltui/components';`,
  usage: {
    provider: `provideVoltTheme({ color: 'ember', style: 'soft', dark: false })`,
    dynamic: `applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true })`,
  },
  densities: ['compact', 'comfortable', 'spacious'],
  /** Additive (plan 08): a palette of the app's own, e.g. exported by Theme Studio. */
  customThemes: {
    summary:
      'A custom palette is CSS the app imports after @voltui/components/themes.css, selected by name. Declare the name with voltCustomColor() and every theme API accepts it; there is no registry and nothing is fetched.',
    studio: 'https://voltui.dev/create-theme',
    steps: [
      "Export the palette's CSS from Theme Studio (or write the two selectors by hand) and save it as e.g. src/acme.css.",
      "Import it after Volt's themes: @import 'tailwindcss'; @import '@voltui/components/themes.css'; @import './acme.css';",
      "Declare the name: export const acme = voltCustomColor('acme'); — it throws for a malformed name or a shipped palette's name.",
      'Use it like a shipped palette: provideVoltTheme({ color: acme, style: \'soft\' }), applyVoltTheme({ color: acme }), [voltTheme]="{ color: acme, dark: true }".',
      'For a stored visitor choice before first paint: voltThemeInitScript({ defaults: { color: acme }, customColors: [acme] }). Undeclared stored names fall back to the defaults.',
    ],
    usage: `import { provideVoltTheme, voltCustomColor } from '@voltui/components';

export const acme = voltCustomColor('acme');
export const providers = [provideVoltTheme({ color: acme, style: 'soft', density: 'compact' })];`,
    nameRule:
      'Lowercase letters, digits and single hyphens, starting with a letter, at most 48 characters; not volt, ember, sage, dusk or glacier.',
    paletteVsStyle:
      'The exported CSS is a palette (data-color) plus only the shape values changed in the studio. Style (data-style) and density (data-density) stay configuration. Shape overrides win over the style because the file is imported after it; nested scopes without their own style inherit them.',
    customStyles: 'voltCustomStyle() and customStyles do the same for a style preset of your own.',
    copyMode:
      'CLI-copied components: uiCustomColor / uiCustomStyle from your copied ./ui/theme (the CLI renames the volt prefix); provideVoltTheme and applyVoltTheme keep their names.',
    scopes:
      'Light and dark scopes, nested either way with the shipped palettes, and overlays opened inside a scope (voltThemeInherit). Toasts belong to the page.',
    availability: capabilityReport(capabilityById('components.custom-themes'), {}),
  },
};

function getComponent(key: string): ComponentMeta | undefined {
  return components[key];
}

/** The components a release capability concerns (declared, or the owners of the names it adds). */
function capabilityComponents(capability: (typeof RELEASE_CAPABILITIES)[number]): string[] {
  if (capability.components) return [...capability.components];
  if (capability.probe.kind === 'package-exports') {
    return [...new Set(capability.probe.names.map(name => VOLT_NAMES.exportOwners[name]))];
  }
  return [];
}

/**
 * Version facts for one component: what this server describes, what npm serves, and the
 * capabilities of this component that npm (or the consumer's installed version) does not have.
 * Additive: older clients ignore it.
 */
function componentAvailability(key: string, componentsVersion?: string) {
  const installed: ConsumerVersions = isPlainVersion(componentsVersion)
    ? { components: componentsVersion }
    : {};
  const context = versionContext(installed);
  const relevant = RELEASE_CAPABILITIES.filter(
    c => c.package === '@voltui/components' && capabilityComponents(c).includes(key)
  ).map(c => capabilityReport(c, installed));
  return {
    describesVersion: context.describes['@voltui/components'],
    publishedOnNpm: context.publishedOnNpm['@voltui/components'],
    ...(installed.components ? { installedVersion: installed.components } : {}),
    notOnNpmYet: relevant.filter(r => r.published !== 'available'),
    ...(installed.components
      ? { notInInstalledVersion: relevant.filter(r => r.installed === 'unavailable') }
      : {}),
  };
}

const versionInput = {
  componentsVersion: z
    .string()
    .optional()
    .describe(
      'The @voltui/components version installed in the project (package.json, e.g. "1.3.3"). Capabilities newer than it are reported as unavailable.'
    ),
};

/** How the consumer uses Volt: the package (`Volt*`, `volt-*`) or CLI-copied source (`Ui*`, `ui-*`). */
export type DistributionMode = 'package' | 'copy';

/**
 * The metadata is held in the package's names. A CLI-copy project (the default when no mode is
 * given, as before) gets the names `@voltui/cli add` writes: `volt-card` → `ui-card`, `voltButton`
 * → `uiButton`, `VoltCard` → `UiCard`, and `@voltui/components` imports become `./ui/<component>`.
 * Only names the library declares are renamed, so prose, CSS custom properties and preset names
 * stay as they are.
 */
export function forMode<T>(value: T, mode: DistributionMode | undefined): T {
  if (mode === 'package') return value;
  const walk = (v: unknown): unknown =>
    typeof v === 'string'
      ? distribution.toCopyMode(v)
      : Array.isArray(v)
        ? v.map(walk)
        : v && typeof v === 'object'
          ? Object.fromEntries(Object.entries(v).map(([k, val]) => [k, walk(val)]))
          : v;
  return walk(value) as T;
}

/** What the component is for and where it stops — generated from the Storybook guides. */
function responsibilityOf(key: string) {
  return RESPONSIBILITIES[key];
}

/** The classes a template needs (directives and components), not services or helpers. */
function templateClasses(comp: ComponentMeta): string[] {
  return comp.directives.map(d => d.className);
}

function getUsageExample(key: string, mode?: DistributionMode) {
  const comp = getComponent(key);
  if (!comp) return undefined;
  const classes = templateClasses(comp);
  const names = classes.length ? classes : comp.imports;
  const imports = {
    npm: `import { ${names.join(', ')} } from '@voltui/components';`,
    cli: `import { ${names.map(n => n.replace(/^Volt(?=[A-Z])/, 'Ui').replace(/^volt(?=[A-Z])/, 'ui')).join(', ')} } from './ui/${key}';`,
  };
  const source = USAGE_SOURCES[key];
  return {
    component: key,
    mode: mode ?? 'both',
    imports:
      mode === 'package' ? { npm: imports.npm } : mode === 'copy' ? { cli: imports.cli } : imports,
    // Template fragments, compiled inside a documented host (scripts/check-examples.mjs).
    examples: forMode(comp.examples, mode === 'package' ? 'package' : 'copy'),
    ...(comp.code ? { code: forMode(comp.code, mode === 'package' ? 'package' : 'copy') } : {}),
    // The complete standalone component shown on voltui.dev, compiled in both modes.
    ...(source
      ? mode === 'package'
        ? { source }
        : mode === 'copy'
          ? { source: distribution.toCopyMode(source), cli: distribution.cliAddCommand(source) }
          : {
              source: { package: source, copy: distribution.toCopyMode(source) },
              cli: distribution.cliAddCommand(source),
            }
      : {}),
  };
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'into',
  'when',
  'what',
  'need',
  'want',
  'user',
  'users',
  'should',
  'would',
  'can',
  'how',
  'use',
  'using',
  'make',
  'build',
  'show',
]);

/** Candidates for an intent, best first. A plain keyword score over the generated responsibilities. */
export function findComponents(intent: string, opts: { category?: string; limit?: number } = {}) {
  const words = [...new Set(intent.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? [])].filter(
    w => !STOP_WORDS.has(w)
  );
  const hits = (text: string) => words.filter(w => text.includes(w)).length;
  return Object.entries(RESPONSIBILITIES)
    .filter(([key]) => key in components)
    .filter(([, r]) => !opts.category || r.category.toLowerCase() === opts.category.toLowerCase())
    .map(([key, r]) => ({
      key,
      score:
        hits(`${key} ${r.title}`.toLowerCase()) * 4 +
        hits(r.summary.toLowerCase()) * 2 +
        hits(r.useWhen.join(' ').toLowerCase()),
      ...r,
    }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key))
    .slice(0, opts.limit ?? 6);
}

// ---------------------------------------------------------------------------
// Public inventory — what the GET discovery response advertises. mcp.spec.ts checks it against
// what createMcpServer() really registers, so the two cannot drift apart again.
// ---------------------------------------------------------------------------

export const SERVER_INVENTORY = {
  tools: [
    { name: 'list_components', description: 'List all Volt UI components' },
    {
      name: 'find_components',
      description:
        'Find the components that fit a need, with when to use them and what they are not for',
    },
    { name: 'get_component', description: 'Get detailed component metadata' },
    { name: 'get_usage_example', description: 'Get Angular usage examples' },
    { name: 'get_theme_info', description: 'Get theme configuration info' },
    { name: 'get_project_info', description: 'Get project overview' },
    {
      name: 'find_compositions',
      description:
        'Find Recipes blocks, layouts and workflow patterns, with install commands and the logic the application owns',
    },
    {
      name: 'generate_cli_command',
      description: 'Generate Volt UI CLI commands (init, add, diff, list)',
    },
  ],
  resources: [
    { uri: 'component://{name}', description: 'Component metadata' },
    { uri: 'theme://info', description: 'Theme info' },
    { uri: 'project://info', description: 'Project info' },
  ],
  prompts: [
    { name: 'generate-volt-ui-component', description: 'Generate component usage' },
    { name: 'volt-ui-troubleshooting', description: 'Troubleshoot Volt UI issues' },
  ],
} as const;

// ---------------------------------------------------------------------------
// MCP server factory
// ---------------------------------------------------------------------------

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: 'volt-ui',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
        logging: {},
      },
      instructions:
        'Volt UI is an Angular component library inspired by shadcn/ui and built on top of ng-primitives. ' +
        'Use the tools, resources, and prompts here to generate correct selectors, import paths, and usage examples.',
    }
  );

  // Tools
  server.registerTool(
    'list_components',
    {
      description:
        'List Volt UI components with their category, status (stable/beta) and what each is for. Filter by category or status.',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe('Forms & Inputs, Controls, Navigation, Overlays, Display or Layout.'),
        status: z.enum(['stable', 'beta', 'experimental']).optional(),
      },
    },
    async ({ category, status }) => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            Object.entries(components)
              .map(([key, comp]) => {
                const r = responsibilityOf(key);
                return {
                  name: key,
                  displayName: comp.name,
                  description: comp.description,
                  category: r?.category,
                  status: r?.status,
                  responsibility: r?.summary,
                };
              })
              .filter(c => !category || c.category?.toLowerCase() === category.toLowerCase())
              .filter(c => !status || c.status === status),
            null,
            2
          ),
        },
      ],
    })
  );

  server.registerTool(
    'find_components',
    {
      description:
        'Find the Volt UI components that fit a need, best first, each with what it is for, when to use it, what it is NOT for and its neighbours. Use this before building UI by hand, then get_component for the exact API.',
      inputSchema: {
        intent: z
          .string()
          .min(2)
          .describe(
            'What the UI must do, e.g. "confirm a destructive action" or "search a list from the server".'
          ),
        category: z.string().optional(),
        limit: z.number().int().min(1).max(15).optional(),
      },
    },
    async ({ intent, category, limit }) => {
      const matches = findComponents(intent, { category, limit });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              matches.length
                ? matches
                : {
                    matches: [],
                    hint: 'Nothing matched. Try list_components, or describe the responsibility with other words. If Volt has no component for it, say so rather than rebuilding an atom.',
                  },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    'get_component',
    {
      description:
        'Get detailed information about a specific Volt UI component including inputs, variants, subcomponents, and usage examples.',
      inputSchema: {
        name: z
          .string()
          .describe('Component key (e.g. "button", "card", "form-field")')
          .refine(val => componentKeys.includes(val), {
            message: `Unknown component. Valid: ${componentKeys.join(', ')}`,
          }),
        mode: z
          .enum(['package', 'copy'])
          .optional()
          .describe(
            'The project\'s distribution mode: "package" returns volt-* selectors and Volt* classes, "copy" returns ui-* and Ui*. A project whose package.json depends on @voltui/components is "package". Omit to get the copy-mode names.'
          ),
        ...versionInput,
      },
    },
    async ({ name, mode, componentsVersion }) => {
      const comp = getComponent(name);
      if (!comp) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Component "${name}" not found.` }, null, 2),
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                ...forMode(comp, mode),
                mode: mode ?? 'copy',
                describesVersion: LIBRARY_VERSION,
                responsibility: responsibilityOf(name),
                availability: componentAvailability(name, componentsVersion),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    'get_usage_example',
    {
      description: 'Get Angular template usage examples and import path for a Volt UI component.',
      inputSchema: {
        component: z
          .string()
          .describe('Component key (e.g. "button", "accordion")')
          .refine(val => componentKeys.includes(val), {
            message: `Unknown component. Valid: ${componentKeys.join(', ')}`,
          }),
        mode: z
          .enum(['package', 'copy'])
          .optional()
          .describe("The project's distribution mode; omit for both import styles."),
        ...versionInput,
      },
    },
    async ({ component, mode, componentsVersion }) => {
      const found = getUsageExample(component, mode);
      const example = found
        ? { ...found, availability: componentAvailability(component, componentsVersion) }
        : undefined;
      if (!example) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Component "${component}" not found.` }, null, 2),
            },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(example, null, 2) }],
      };
    }
  );

  server.registerTool(
    'get_theme_info',
    {
      description: 'Get available Volt UI themes, colors, and how to configure them.',
    },
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(themeInfo, null, 2) }],
    })
  );

  server.registerTool(
    'get_project_info',
    {
      description:
        'Get general information about the Volt UI project: framework, architecture, naming conventions, and which versions it describes versus what npm serves. Pass the versions installed in the project to learn which documented capabilities it lacks.',
      inputSchema: {
        ...versionInput,
        cliVersion: z
          .string()
          .optional()
          .describe('The @voltui/cli version the project runs (e.g. "1.3.3").'),
        agentVersion: z.string().optional().describe('The installed @voltui/agent version.'),
      },
    },
    async ({ componentsVersion, cliVersion, agentVersion }) => {
      const installed: ConsumerVersions = Object.fromEntries(
        [
          ['components', componentsVersion],
          ['cli', cliVersion],
          ['agent', agentVersion],
        ].filter(([, v]) => isPlainVersion(v))
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ ...projectInfo, versions: versionContext(installed) }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'find_compositions',
    {
      description:
        'Find Volt UI Recipes compositions — blocks (page sections), layouts (page skeletons) and workflow patterns (forms, async search, data tables) — with their purpose, the Volt components they use, install commands for package and CLI-copy mode, where the source is, and which logic stays with the application. Use this before hand-building a page section, app shell or workflow.',
      inputSchema: {
        intent: z
          .string()
          .optional()
          .describe('What you need, e.g. "pricing section", "settings form", "dashboard shell".'),
        kind: z.enum(['blocks', 'layouts', 'patterns']).optional(),
        component: z
          .string()
          .optional()
          .describe('Only compositions that use this component key (e.g. "table").'),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async ({ intent, kind, component, limit }) => {
      if (component && !componentKeys.includes(component)) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown component "${component}".` }, null, 2),
            },
          ],
          isError: true,
        };
      }
      const matches = findCompositions({ intent, kind, component, limit });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              matches.length
                ? matches
                : {
                    matches: [],
                    hint: 'No composition matched. Try another wording, a kind, or find_components for single components.',
                  },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    'generate_cli_command',
    {
      description:
        'Generate the npx command to set up Volt UI, copy components, compare a customised copy with the CLI reference (read-only diff) or list components.',
      inputSchema: {
        action: z
          .enum(['init', 'add', 'diff', 'list'])
          .describe(
            '"init" to set up Volt UI, "add" to copy a component, "diff" to compare a copied (possibly customised) component with the source shipped in the CLI version that runs — read-only, never changes files — and "list" to list components.'
          ),
        component: z
          .string()
          .optional()
          .describe(
            'Component name — required when action is "add" or "diff" (several may be separated by spaces).'
          ),
        components: z
          .array(z.string())
          .optional()
          .describe('Several component names for one "add" or "diff".'),
        targetDir: z
          .string()
          .optional()
          .describe('Target directory (optional), relative to the project, no ".." segments.'),
        track: z
          .boolean()
          .optional()
          .describe(
            '"add" only: also record what was copied in <targetDir>/.volt-ui.json, so a later "diff" can tell local edits from reference changes.'
          ),
        json: z.boolean().optional().describe('"diff" only: machine-readable JSON output.'),
        cliVersion: z
          .string()
          .optional()
          .describe(
            'The @voltui/cli version the project runs. Omit to get the command for the version this server describes, with a note when npm does not serve it yet.'
          ),
      },
    },
    async ({ action, component, components: many, targetDir, track, json, cliVersion }) => {
      const names = [
        ...(component ? component.split(/[\s,]+/).filter(Boolean) : []),
        ...(many ?? []),
      ];
      const result = buildCliCommand(
        { action, components: names, targetDir, track, json, cliVersion },
        componentKeys
      );
      if ('error' in result) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
          isError: true,
        };
      }
      // `note` is kept for existing clients; `notes` carries every note.
      const body = {
        command: result.command,
        argv: result.argv,
        requires: result.requires,
        ...(result.notes.length ? { note: result.notes[0], notes: result.notes } : {}),
        ...(result.availability ? { availability: result.availability } : {}),
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(body, null, 2) }],
      };
    }
  );

  // Resources
  server.registerResource(
    'component',
    new ResourceTemplate('component://{name}', {
      list: async () => ({
        resources: Object.entries(components).map(([key, comp]) => ({
          uri: `component://${key}`,
          name: comp.name,
          mimeType: 'application/json',
          description: comp.description,
        })),
      }),
    }),
    {
      mimeType: 'application/json',
      description: 'Detailed metadata for a single Volt UI component.',
    },
    async uri => {
      const name = uri.hostname;
      const comp = getComponent(name);
      if (!comp) {
        return {
          contents: [
            {
              uri: uri.toString(),
              mimeType: 'application/json',
              text: JSON.stringify({ error: `Component "${name}" not found.` }, null, 2),
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: 'application/json',
            text: JSON.stringify(comp, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    'theme',
    'theme://info',
    {
      mimeType: 'application/json',
      description: 'Volt UI theme colors, styles, and configuration helpers.',
    },
    async uri => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify(themeInfo, null, 2),
        },
      ],
    })
  );

  server.registerResource(
    'project',
    'project://info',
    {
      mimeType: 'application/json',
      description: 'General information about the Volt UI project.',
    },
    async uri => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify({ ...projectInfo, versions: versionContext() }, null, 2),
        },
      ],
    })
  );

  // Prompts
  server.registerPrompt(
    'generate-volt-ui-component',
    {
      description: 'Prompt for generating a Volt UI component usage example.',
      argsSchema: {
        component: z
          .string()
          .describe('Component key (e.g. "button", "form-field")')
          .refine(val => componentKeys.includes(val), {
            message: `Unknown component. Valid: ${componentKeys.join(', ')}`,
          }),
        context: z
          .string()
          .optional()
          .describe('Extra context about what the component should do.'),
      },
    },
    async ({ component, context }) => {
      const comp = getComponent(component);
      const example = getUsageExample(component);
      const isOverlay = overlayComponents.has(component);
      const isCva = cvaComponents.has(component);

      const requirements = [
        'Generate a complete, production-ready Angular example using the component above.',
        'Use standalone components and OnPush change detection.',
        "Import copied components from './ui/<component>' using the `ui-*` / `UiXxx` naming.",
        'Use semantic Tailwind utilities such as `bg-primary`, `text-foreground`, `rounded-md`, `shadow-sm`.',
        isOverlay
          ? 'This is an OVERLAY component: use an attribute-directive trigger on a native element and place the overlay content inside an `<ng-template>` that receives a `close` context. Never use a `<ui-' +
            component +
            '>` element selector.'
          : '',
        isCva
          ? 'This component implements ControlValueAccessor: show Reactive Forms wiring with `formControlName` and mention that `ReactiveFormsModule` must be imported.'
          : '',
        'Apply the current theme via `provideVoltTheme` or `applyVoltTheme` when relevant.',
        'Do not invent inputs, outputs, or selectors that are not listed in the metadata.',
      ]
        .filter(Boolean)
        .join('\n');

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                buildSystemContext(),
                '',
                '---',
                '',
                `Generate a complete Angular example using the Volt UI ${comp?.name ?? component} component.`,
                '',
                'Component metadata:',
                JSON.stringify(comp, null, 2),
                '',
                example ? `Usage example:\n${JSON.stringify(example, null, 2)}` : '',
                '',
                'Requirements:',
                requirements,
                '',
                context ? `Additional context: ${context}` : '',
              ]
                .filter(Boolean)
                .join('\n'),
            },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'volt-ui-troubleshooting',
    {
      description: 'Prompt for troubleshooting common Volt UI mistakes.',
      argsSchema: {
        issue: z.string().describe('Description of the issue or error message.'),
      },
    },
    async ({ issue }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              buildSystemContext(),
              '',
              '---',
              '',
              'The user is experiencing an issue with Volt UI.',
              '',
              `Issue description:\n${issue}`,
              '',
              'Please diagnose the problem step by step. Use the following checklist:',
              '',
              '1. **Naming conventions** — is the code using `ui-*` / `UiXxx` for copied components and `volt-*` / `VoltXxx` only for imports from `@voltui/components`?',
              '2. **Overlay pattern** — if the issue involves dialog, drawer, popover, tooltip, or dropdown-menu, verify the trigger uses an attribute directive and the content is inside an `<ng-template>` with a `close` context.',
              '3. **Reactive Forms wiring** — if the component is a CVA (checkbox, input, radio, select, switch, textarea, slider, toggle, etc.), verify `ReactiveFormsModule` is imported and the component is bound with `formControlName`.',
              '4. **Theme setup** — confirm `@voltui/components/themes.css` is imported after Tailwind and `provideVoltTheme` is configured.',
              '5. **Component copied** — if the class is not found, the component may not have been copied via `npx @voltui/cli add <name>`.',
              '6. **Standalone / OnPush / signals** — ensure new components are standalone, use OnPush, and prefer signals over zone-based patterns.',
              '',
              'If you need more data, call the MCP `get_component` tool or read the `component://<name>` resource before proposing a fix.',
            ].join('\n'),
          },
        },
      ],
    })
  );

  return server;
}

// ---------------------------------------------------------------------------
// CORS / security
// ---------------------------------------------------------------------------

const allowedOrigins = new Set([
  'https://voltui.dev',
  'https://www.voltui.dev',
  'https://volt-ui.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]);

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // server-to-server or same-origin
  return allowedOrigins.has(origin);
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version',
};

// ---------------------------------------------------------------------------
// Accept header
//
// The Streamable HTTP transport answers 406 unless `Accept` lists both application/json and
// text/event-stream. A client that sends both can still arrive here without them: the request is
// rebuilt on the way through the Worker, and an intermediary may rewrite Accept. This server
// replies with plain JSON (`enableJsonResponse`), so both types are always acceptable — state it
// ourselves instead of rejecting a compliant client.
// ---------------------------------------------------------------------------

const STREAMABLE_ACCEPT = 'application/json, text/event-stream';

export async function withStreamableAccept(request: Request): Promise<Request> {
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('application/json') && accept.includes('text/event-stream')) return request;

  const headers = new Headers(request.headers);
  headers.set('accept', STREAMABLE_ACCEPT);
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  return new Request(request.url, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
  });
}

// ---------------------------------------------------------------------------
// Human-readable discovery response
// ---------------------------------------------------------------------------

export function discoveryResponse(): Response {
  const base = 'https://voltui.dev/api/mcp';
  return new Response(
    JSON.stringify(
      {
        name: 'Volt UI MCP Server',
        protocol: 'Model Context Protocol (Streamable HTTP)',
        transport: 'Streamable HTTP',
        setup: {
          cli: 'npx @voltui/agent',
          configUrl: `${base}/setup`,
          agents: [
            'claude',
            'cursor',
            'windsurf',
            'copilot',
            'codex',
            'gemini',
            'opencode',
            'vscode',
          ].map(agent => ({
            agent,
            configUrl: `${base}/setup?agent=${agent}`,
          })),
        },
        ...SERVER_INVENTORY,
      },
      null,
      2
    ),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// ---------------------------------------------------------------------------
// Analog / Nitro event handler
// ---------------------------------------------------------------------------

export default defineEventHandler(async event => {
  setHeaders(event, corsHeaders);

  const method = getMethod(event);

  if (method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    return null;
  }

  const origin = getRequestHeader(event, 'origin') ?? undefined;
  if (!isOriginAllowed(origin)) {
    event.node.res.statusCode = 403;
    return { error: 'Origin not allowed' };
  }

  // GET is used by humans browsing the endpoint; return discovery JSON.
  if (method === 'GET') {
    return sendWebResponse(event, discoveryResponse());
  }

  // POST/DELETE are handled by the MCP transport.
  const request = await withStreamableAccept(toWebRequest(event));
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
    enableJsonResponse: true, // return JSON instead of SSE for POSTs
  });
  const server = createMcpServer();
  await server.connect(transport);

  const response = await transport.handleRequest(request);
  return sendWebResponse(event, response);
});
