/**
 * Structured data that only states what the page really is.
 *
 * Deliberately absent: ratings, reviews, prices, FAQ and Product markup. Volt UI is a free
 * open-source library and none of those exist on either site.
 */
export type JsonLd = Record<string, unknown>;

export interface Crumb {
  readonly name: string;
  readonly path: string;
}

/** `Volt UI › Components › Button`, matching the header and the sidebar. Paths are made absolute by the caller's origin. */
export function breadcrumbJsonLd(
  crumbs: readonly Crumb[],
  absoluteUrl: (path: string) => string
): JsonLd {
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
