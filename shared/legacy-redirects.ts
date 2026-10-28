/**
 * The redirects that carried `voltui.dev/docs/{blocks,layouts,recipes}/*` to Volt UI Recipes.
 *
 * Blocks, layouts and recipes used to be pages of the docs site. They moved to their own
 * application, and every URL anyone could have linked to keeps working: each old path maps to
 * exactly one new path, in every locale, with a permanent redirect.
 *
 * Deliberately a finite, generated table and not a wildcard. `/docs/blocks/*` would also catch a
 * future docs page that happens to start with that prefix, and a typo'd old URL should 404 on
 * the docs site rather than bounce to a Recipes 404. Rules come from the Recipes catalog, so a
 * new entry is redirectable the moment it exists — and `legacy-redirects.spec.ts` fails if an
 * entry has no rule or a rule has no destination.
 *
 * Kept free of Angular and Vite imports: `vite.config.ts` loads it at build time.
 */
export const RECIPES_ORIGIN = 'https://recipes.voltui.dev';

/** The section prefixes the docs site used, by catalog kind. */
export const LEGACY_PREFIX = {
  blocks: '/docs/blocks',
  layouts: '/docs/layouts',
  recipes: '/docs/recipes',
} as const;

export type LegacyKind = keyof typeof LEGACY_PREFIX;

export interface LegacyRedirect {
  readonly from: string;
  readonly to: string;
}

export interface LegacyRedirectInput {
  readonly locales: readonly string[];
  readonly sourceLocale: string;
  /** Every catalog entry's route on the Recipes origin, e.g. `/blocks/hero`. */
  readonly entries: readonly { readonly kind: LegacyKind; readonly path: string }[];
}

export function legacyRedirects({
  locales,
  sourceLocale,
  entries,
}: LegacyRedirectInput): LegacyRedirect[] {
  const kinds = Object.keys(LEGACY_PREFIX) as LegacyKind[];
  // The section index and every entry, by their path on the Recipes origin.
  const targets = [
    ...kinds.map(kind => ({ kind, path: `/${kind}` })),
    ...entries.map(entry => ({ kind: entry.kind, path: entry.path })),
  ];

  return locales.flatMap(locale => {
    const prefix = locale === sourceLocale ? '' : `/${locale}`;
    return targets.map(({ kind, path }) => ({
      from: `${prefix}${LEGACY_PREFIX[kind]}${path.slice(`/${kind}`.length)}`,
      to: `${RECIPES_ORIGIN}${prefix}${path}`,
    }));
  });
}

/** The same table as Nitro `routeRules`: permanent redirects, one per old path. */
export function legacyRouteRules(
  input: LegacyRedirectInput
): Record<string, { redirect: { to: string; statusCode: 301 } }> {
  return Object.fromEntries(
    legacyRedirects(input).map(({ from, to }) => [from, { redirect: { to, statusCode: 301 } }])
  );
}
