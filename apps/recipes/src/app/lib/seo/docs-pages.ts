/**
 * The documentation pages (Doqs), read from the Markdown files themselves so the page head, the
 * sitemap and `llms.txt` use the same title and description a reader sees — in each language.
 *
 * `import.meta.glob` is resolved by Vite in the app build, in tests and in the build-time
 * generators alike, so this module needs no Angular and no file-system access of its own.
 */
const files = import.meta.glob('../../../content/docs*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface DocPage {
  /** The file name without extension; also the last URL segment. */
  readonly slug: string;
  /** Route without a locale prefix: `/docs/copying-a-recipe`. */
  readonly path: string;
  readonly titles: Readonly<Record<string, string>>;
  readonly descriptions: Readonly<Record<string, string>>;
}

const front = (source: string, key: string): string =>
  source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim() ?? '';

/** `docs` is English; `docs-es` is Spanish. */
const localeOf = (file: string): string => file.match(/\/docs(?:-([a-z]+))?\//)?.[1] ?? 'en';

const bySlug = new Map<
  string,
  { titles: Record<string, string>; descriptions: Record<string, string> }
>();
for (const [file, source] of Object.entries(files)) {
  const slug = file.split('/').pop()!.replace(/\.md$/, '');
  const entry = bySlug.get(slug) ?? { titles: {}, descriptions: {} };
  entry.titles[localeOf(file)] = front(source, 'title');
  entry.descriptions[localeOf(file)] = front(source, 'description');
  bySlug.set(slug, entry);
}

export const DOC_PAGES: readonly DocPage[] = [...bySlug.entries()]
  .map(([slug, { titles, descriptions }]) => ({
    slug,
    path: `/docs/${slug}`,
    titles,
    descriptions,
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug));
