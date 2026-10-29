import { GITHUB_URL, LICENSE_URL, NPM_PACKAGES, SITE_NAME, SITE_ORIGIN, absoluteUrl } from './site';

import {
  breadcrumbJsonLd as breadcrumb,
  serializeJsonLd,
  type Crumb,
  type JsonLd,
} from '@shared/seo/json-ld';

export { serializeJsonLd, type Crumb, type JsonLd };

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
      // The published library, the same code as this repository.
      sameAs: NPM_PACKAGES[0].url,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    },
  ];
}

/** `Volt UI › Components › Button`, matching the header and the docs sidebar. */
export const breadcrumbJsonLd = (crumbs: readonly Crumb[]): JsonLd =>
  breadcrumb(crumbs, absoluteUrl);
