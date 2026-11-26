/**
 * Recipes compositions (blocks, layouts, patterns) for agents: `find_compositions`.
 *
 * The facts — files, Volt components, npm packages, page URL — come from
 * packages/shared/lib/compositions.generated.ts, which is generated from the source the Recipes pages
 * show (scripts/generate-compositions.mjs). This file adds only what code cannot say: what each
 * workflow pattern is for and which logic stays with the application. English, for agents; the
 * pages themselves are translated.
 */
import {
  COMPOSITIONS,
  type CompositionKind,
  type CompositionManifestEntry,
} from '../../../../../../packages/shared/lib/compositions.generated';
import { PUBLISHED_COMPOSITION_EXCEPTIONS } from '../../../../../../packages/shared/lib/published-exceptions';

export interface PatternGuide {
  readonly purpose: string;
  readonly useWhen: string;
  /** State the consumer owns; Volt components own none of it. */
  readonly consumerState: readonly string[];
  /** The one function to replace with the application's service. */
  readonly connect: string;
  readonly loadingAndErrors: string;
}

/** The workflow patterns: what they solve, and the line between Volt and the application. */
export const PATTERN_GUIDES: Readonly<Record<string, PatternGuide>> = {
  'settings-form': {
    purpose:
      'A settings form with validation, exactly one in-flight save, and recovery that never loses what the user typed.',
    useWhen:
      'Editing a saved record (profile, preferences) that is loaded, changed and saved as a whole.',
    consumerState: [
      'the FormGroup and its validators',
      'the last saved values (the baseline that defines "unsaved changes")',
      'the pending flag and the last result (saved / failed message)',
    ],
    connect:
      'Replace `fakeSave` or pass your own `(value) => Promise<Settings>` to the `[save]` input; the resolved value becomes the new baseline.',
    loadingAndErrors:
      'Save and Cancel use aria-disabled while a save is pending so focus is kept; failure keeps the input and a second Save retries; input typed during a save stays as unsaved.',
  },
  'async-search': {
    purpose:
      'Server-side search with a combobox: debounced queries, latest-response-wins, selection kept by id.',
    useWhen:
      'The server decides what matches (search by email, alias, remote index), not a list already in memory.',
    consumerState: [
      'the query, results, loading and error signals',
      'the request ticket that discards stale responses',
      'the selected item, kept separately from the result list',
    ],
    connect:
      'Replace `fakeSearch` or pass your own `(query) => Promise<Person[]>` to `[search]`. Keep `filterMode="manual"` so Volt does not re-filter server results.',
    loadingAndErrors:
      'The combobox shows loading and empty text; a failed search shows an alert with Retry and keeps the current selection.',
  },
  'data-table': {
    purpose:
      'A data table with sort, filter, pagination and every state: first load, reload, empty dataset, no match, error.',
    useWhen:
      'A paged list fetched from a service. There is no VoltDataTable on purpose: the behaviour is a few signals you own.',
    consumerState: [
      'query (filter, sort, direction, page, page size)',
      'the current page of rows and the total counts',
      'loading and error',
    ],
    connect:
      'Replace `fakeFetch` with your `(query) => Promise<InvoicePage>`; keep the request shape (query, sort, page).',
    loadingAndErrors:
      'Skeleton rows on first load, previous rows dimmed with aria-busy while reloading, separate empty states for "no data" and "no match", and an alert with Retry on failure.',
  },
  'live-playground': {
    purpose:
      'Controls, state, live preview and generated code that cannot disagree, from one signal.',
    useWhen: 'An in-app configurator or documentation playground for one component.',
    consumerState: ['the settings signal the preview and the code are computed from'],
    connect:
      'Nothing to connect: it is local state. Add a control by adding a field to the settings signal.',
    loadingAndErrors: 'No asynchronous work.',
  },
  'component-explorer': {
    purpose: 'Pick a component, a variant and a state; see it working and copy the matching code.',
    useWhen: 'A small internal catalog of the components your product uses.',
    consumerState: ['the selected component, variant and state'],
    connect: 'Nothing to connect: add a component with one entry, one @case and one usage branch.',
    loadingAndErrors: 'No asynchronous work; the spinner example only shows a loading state.',
  },
  'section-nav': {
    purpose:
      'A scroll-spy section navigation: native `#id` links, the section on screen highlighted, arrow keys between links.',
    useWhen: 'A long page split into anchored sections (settings, documentation, a report).',
    consumerState: ['the list of sections and the active one'],
    connect:
      'Give it your sections and the sticky header height (`offset`); one IntersectionObserver tracks them in the browser.',
    loadingAndErrors: 'No asynchronous work.',
  },
};

const KIND_LABEL: Record<CompositionKind, string> = {
  blocks: 'block (a finished page section)',
  layouts: 'layout (a page skeleton)',
  patterns: 'pattern (behaviour over time)',
};

const humanize = (slug: string) => slug.replace(/-/g, ' ');

/** One composition as an agent needs it to decide, install and adapt it. */
export function describeComposition(entry: CompositionManifestEntry) {
  const slug = entry.id.split('/').pop() ?? entry.slug;
  const guide = entry.kind === 'patterns' ? PATTERN_GUIDES[slug] : undefined;
  const packages = entry.packages;
  const exceptions = PUBLISHED_COMPOSITION_EXCEPTIONS.filter(e => e.id === entry.id);
  return {
    id: entry.id,
    kind: entry.kind,
    name: humanize(entry.slug),
    description:
      guide?.purpose ??
      `A ${KIND_LABEL[entry.kind]}${entry.group ? ` in the "${entry.group}" group` : ''}: ${humanize(entry.slug)}.`,
    ...(guide ? { useWhen: guide.useWhen } : {}),
    url: entry.url,
    components: entry.components,
    packages,
    files: entry.files,
    source:
      'Copyable source on the page (url), shown in package and CLI-copy mode; it is not an npm export of @voltui/components. Fetch it from the page or copy it by hand: do not regenerate an equivalent UI.',
    install: {
      package: {
        command: ['npm install @voltui/components', ...packages].join(' '),
        imports: '@voltui/components',
      },
      copy: {
        commands: [
          ...(entry.components.length ? [`npx @voltui/cli add ${entry.components.join(' ')}`] : []),
          ...(packages.length ? [`npm install ${packages.join(' ')}`] : []),
        ],
        placement: `src/app/${entry.folder}/ (${entry.files.join(', ')}); components in src/app/ui/, imported as ../ui/<component>`,
      },
    },
    ...(guide
      ? {
          applicationOwned: {
            state: guide.consumerState,
            connect: guide.connect,
            loadingAndErrors: guide.loadingAndErrors,
          },
        }
      : {
          applicationOwned: {
            state: [
              'content, links and actions are placeholders: wire them to your routes and data',
            ],
          },
        }),
    ...(exceptions.length
      ? {
          compatibility: exceptions.map(e => ({
            mode: e.mode,
            needs: e.capability,
            note: 'Does not work with the version npm serves today; see get_project_info capabilities.',
          })),
        }
      : {}),
  };
}

const STOP = new Set([
  'the',
  'and',
  'for',
  'with',
  'page',
  'a',
  'an',
  'of',
  'to',
  'in',
  'my',
  'need',
  'want',
]);

/** Compositions for an intent, kind or component, best first. Plain keyword scoring, no index. */
export function findCompositions(
  opts: { intent?: string; kind?: CompositionKind; component?: string; limit?: number } = {}
) {
  const words = [...new Set((opts.intent ?? '').toLowerCase().match(/[a-z][a-z-]{1,}/g) ?? [])]
    .flatMap(w => w.split('-'))
    .filter(w => w.length > 2 && !STOP.has(w));
  const scored = COMPOSITIONS.filter(entry => !opts.kind || entry.kind === opts.kind)
    .filter(entry => !opts.component || entry.components.includes(opts.component))
    .map(entry => {
      const slug = entry.id.split('/').pop() ?? entry.slug;
      const guide = entry.kind === 'patterns' ? PATTERN_GUIDES[slug] : undefined;
      const name = `${entry.slug} ${entry.folder} ${entry.group ?? ''}`.replace(/-/g, ' ');
      const text = `${guide?.purpose ?? ''} ${guide?.useWhen ?? ''}`.toLowerCase();
      const parts = entry.components.join(' ');
      const score = words.length
        ? words.filter(w => name.includes(w)).length * 4 +
          words.filter(w => text.includes(w)).length * 2 +
          words.filter(w => parts.includes(w)).length
        : 1;
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  return scored.slice(0, opts.limit ?? 6).map(({ entry }) => describeComposition(entry));
}
