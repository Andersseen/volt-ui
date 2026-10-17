import { GITHUB_URL, LICENSE_URL, SITE_NAME, SITE_ORIGIN, absoluteUrl } from './site';

/**
 * Structured data that only states what the page really is.
 *
 * Deliberately absent: ratings, reviews, prices, FAQ and Product markup. Volt UI is a free
 * open-source library and none of those exist on the site.
 */
export type JsonLd = Record<string, unknown>;

export interface Crumb {
  readonly name: string;
  readonly path: string;
}

/** The site, and the software it documents. Emitted on the home page only. */
export function homeJsonLd(description: string): JsonLd[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      name: SITE_NAME,
      alternateName: 'Volt UI for Angular',
      url: `${SITE_ORIGIN}/`,
      description,
      inLanguage: ['en', 'es', 'uk'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_ORIGIN}/#source`,
      name: SITE_NAME,
      description,
      url: `${SITE_ORIGIN}/`,
      codeRepository: GITHUB_URL,
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Angular',
      license: LICENSE_URL,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    },
  ];
}

/** `Volt UI › Components › Button`, matching the header and the docs sidebar. */
export function breadcrumbJsonLd(crumbs: readonly Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * JSON for an inline `<script>`: a `<` in a string (for example `</script>`) must not be able to
 * end the element.
 */
export function serializeJsonLd(data: JsonLd | readonly JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
