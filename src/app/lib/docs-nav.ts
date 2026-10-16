import type { DocsSidebarGroup, DocsSidebarLink } from '../components/docs/docs-nav-list';

/** A heading collected for the "On this page" list. */
export interface TocItem {
  readonly id: string;
  readonly text: string;
  readonly level: 2 | 3;
}

/** Every link in sidebar order — the reading order the pager walks. */
export function flattenLinks(groups: readonly DocsSidebarGroup[]): DocsSidebarLink[] {
  return groups.flatMap(group => group.links);
}

/** The path of a URL without its query string or fragment, and without a trailing slash. */
export function pathOf(url: string): string {
  const path = url.split(/[?#]/)[0];
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

/**
 * Index of the link the URL is on: an exact match first, otherwise the longest link that is a
 * path prefix of it (a recipe page under its section). `localize` turns a link's path into the
 * URL the reader actually has, locale prefix included.
 */
export function currentIndex(
  links: readonly DocsSidebarLink[],
  url: string,
  localize: (path: string) => string
): number {
  const here = pathOf(url);
  let best = -1;
  let bestLength = -1;

  links.forEach((link, index) => {
    const target = pathOf(localize(link.path));
    if (target === here) {
      best = index;
      bestLength = Number.MAX_SAFE_INTEGER;
    } else if (!link.exact && here.startsWith(`${target}/`) && target.length > bestLength) {
      best = index;
      bestLength = target.length;
    }
  });

  return best;
}

/** A URL fragment for a heading's text, made unique against `taken`. */
export function slugFor(text: string, taken: Set<string>): string {
  const base =
    text
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  let slug = base;
  for (let n = 2; taken.has(slug); n++) {
    slug = `${base}-${n}`;
  }
  taken.add(slug);
  return slug;
}
