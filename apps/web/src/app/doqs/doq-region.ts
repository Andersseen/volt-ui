import type { Route, UrlSegment } from '@angular/router';
import { doqPaths } from '../../doq.paths';

const base = doqPaths.basePath.split('/').filter(Boolean);
const prefixed = doqPaths.i18n.locales
  .filter(locale => locale.id !== doqPaths.i18n.defaultLocale)
  .map(locale => locale.id as string);

/** `/docs/<page>` or `/<locale>/docs/<page>`: a URL Doqs may own. The bare `/docs` is the host's. */
function isDocumentationPage(segments: readonly UrlSegment[]): boolean {
  const offset = prefixed.includes(segments[0]?.path) ? 1 : 0;
  return (
    segments.length > offset + base.length &&
    base.every((part, index) => segments[offset + index]?.path === part)
  );
}

/**
 * The one route the application registers eagerly for Doqs. It consumes nothing and matches only
 * documentation URLs, so the homepage, Theme Studio and every other page never load the region;
 * a documentation URL loads it, and when no Markdown page claims the URL the router backtracks to
 * the host routes registered after it (Etyma's localized file routes).
 */
export const DOQ_REGION_ROUTE: Route = {
  matcher: segments => (isDocumentationPage(segments) ? { consumed: [] } : null),
  loadChildren: () => import('./doq.routes').then(m => m.DOQ_ROUTES),
};
