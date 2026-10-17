import type { PlainTranslationKey } from '../../i18n/i18n';
import { BLOCKS } from '../blocks-metadata';
import { COMPONENTS } from '../component-metadata';
import { LAYOUTS } from '../layouts-metadata';
import { RECIPES } from '../recipes-metadata';

/**
 * Every public, indexable route and where its search metadata comes from.
 *
 * This is the single list the runtime head (`SeoService`), the sitemap and `llms.txt` are built
 * from, so a page cannot appear in one and be missing from another. Component, block, layout and
 * recipe pages are derived from the catalogs that already drive the site; only the handful of
 * guide pages are listed by hand.
 *
 * Not listed on purpose: `/docs` and `/docs/layouts` (redirects), `/api/**` (the MCP server),
 * anything under a locale prefix (the generators add those).
 */
export type SeoEntry =
  | {
      readonly kind: 'page';
      readonly path: string;
      readonly titleKey: PlainTranslationKey;
      readonly descriptionKey: PlainTranslationKey;
    }
  | {
      readonly kind: 'component' | 'block' | 'layout';
      readonly path: string;
      /** The page's own name in the reader's language. */
      readonly nameKey: PlainTranslationKey;
      readonly name?: undefined;
      /** A hand-written description, when the catalog has one worth reusing. */
      readonly descriptionKey?: PlainTranslationKey;
    }
  | {
      /** An entry whose name has no Glossa key: a recipe, or a component that predates its key. */
      readonly kind: 'component' | 'recipe';
      readonly path: string;
      readonly name: string;
      readonly nameKey?: undefined;
      readonly descriptionKey?: undefined;
    };

const PAGES: readonly SeoEntry[] = [
  { kind: 'page', path: '/', titleKey: 'seo.home.title', descriptionKey: 'seo.home.description' },
  {
    kind: 'page',
    path: '/docs/introduction',
    titleKey: 'seo.introduction.title',
    descriptionKey: 'seo.introduction.description',
  },
  {
    kind: 'page',
    path: '/docs/components',
    titleKey: 'seo.components.title',
    descriptionKey: 'seo.components.description',
  },
  {
    kind: 'page',
    path: '/docs/themes',
    titleKey: 'seo.themes.title',
    descriptionKey: 'seo.themes.description',
  },
  {
    kind: 'page',
    path: '/docs/customization',
    titleKey: 'seo.customization.title',
    descriptionKey: 'seo.customization.description',
  },
  {
    kind: 'page',
    path: '/docs/versioning',
    titleKey: 'seo.versioning.title',
    descriptionKey: 'seo.versioning.description',
  },
  {
    kind: 'page',
    path: '/docs/roadmap',
    titleKey: 'seo.roadmap.title',
    descriptionKey: 'seo.roadmap.description',
  },
  {
    kind: 'page',
    path: '/docs/migration-notes',
    titleKey: 'seo.migration.title',
    descriptionKey: 'seo.migration.description',
  },
  {
    kind: 'page',
    path: '/docs/mcp',
    titleKey: 'seo.mcp.title',
    descriptionKey: 'seo.mcp.description',
  },
  {
    kind: 'page',
    path: '/docs/ai-mcp',
    titleKey: 'seo.aiMcp.title',
    descriptionKey: 'seo.aiMcp.description',
  },
  {
    kind: 'page',
    path: '/docs/ai-skill',
    titleKey: 'seo.aiSkill.title',
    descriptionKey: 'seo.aiSkill.description',
  },
  {
    kind: 'page',
    path: '/docs/ai-prompt',
    titleKey: 'seo.aiPrompt.title',
    descriptionKey: 'seo.aiPrompt.description',
  },
  {
    kind: 'page',
    path: '/docs/blocks',
    titleKey: 'seo.blocks.title',
    descriptionKey: 'seo.blocks.description',
  },
  {
    kind: 'page',
    path: '/create-theme',
    titleKey: 'seo.createTheme.title',
    descriptionKey: 'seo.createTheme.description',
  },
];

const COMPONENT_ENTRIES: readonly SeoEntry[] = COMPONENTS.flatMap(component =>
  component.labelKey
    ? [
        {
          kind: 'component' as const,
          path: component.path,
          nameKey: component.labelKey,
          descriptionKey: component.descriptionKey,
        },
      ]
    : []
);

/*
 * A few components (alert, spinner, empty-state) predate their Glossa keys and carry a plain
 * `label`. They still need a page entry, so they are listed with their English name.
 */
const LABEL_ONLY_COMPONENTS = COMPONENTS.filter(component => !component.labelKey);

export const SEO_ENTRIES: readonly SeoEntry[] = [
  ...PAGES,
  ...COMPONENT_ENTRIES,
  ...LABEL_ONLY_COMPONENTS.map((component): SeoEntry => ({
    kind: 'component',
    path: component.path,
    name: component.label ?? component.name,
  })),
  ...BLOCKS.map((block): SeoEntry => ({
    kind: 'block',
    path: block.path,
    nameKey: block.labelKey,
  })),
  ...LAYOUTS.map((layout): SeoEntry => ({
    kind: 'layout',
    path: layout.path,
    nameKey: layout.labelKey,
  })),
  ...RECIPES.map((recipe): SeoEntry => ({ kind: 'recipe', path: recipe.path, name: recipe.label })),
];

export function seoEntryFor(barePath: string): SeoEntry | undefined {
  return SEO_ENTRIES.find(entry => entry.path === barePath);
}
