import { type JsonLd } from '@shared/seo/json-ld';
import { DOCS_ORIGIN, GITHUB_URL, SITE_NAME, SITE_ORIGIN } from '../site';

export { breadcrumbJsonLd, serializeJsonLd, type Crumb, type JsonLd } from '@shared/seo/json-ld';

/** The site, as a part of the Volt UI project it demonstrates. Emitted on the home page only. */
export function homeJsonLd(description: string): JsonLd[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`,
      description,
      inLanguage: ['en', 'es', 'uk'],
      isPartOf: { '@type': 'WebSite', name: 'Volt UI', url: `${DOCS_ORIGIN}/` },
      sameAs: [GITHUB_URL],
    },
  ];
}
