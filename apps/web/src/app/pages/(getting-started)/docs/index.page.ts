import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import type { RouteMeta } from '@analogjs/router';
import { ETYMA_DEFINITION } from '@etyma/angular';

/**
 * `/docs` → the introduction, in the language the URL asks for: `/es/docs` → `/es/docs/introduction`.
 *
 * An absolute `redirectTo: '/docs/introduction'` dropped the prefix. The page then rendered at the
 * unprefixed URL, kept in Spanish only by Etyma's "stay in the current locale" rule, and once the
 * introduction became a Doqs page (whose route activates the locale its URL names) it switched to
 * English mid-hydration. Analog's `redirectTo` takes a string only, so the redirect is a guard that
 * returns the localized URL, on the server and in the browser alike.
 */
const toLocalizedIntroduction: CanActivateFn = (_route, state) => {
  const definition = inject(ETYMA_DEFINITION);
  const target = definition.router.localize(
    '/docs/introduction',
    definition.router.localeOf(state.url)
  );
  return inject(Router).parseUrl(target);
};

export const routeMeta: RouteMeta = {
  canActivate: [toLocalizedIntroduction],
};

/** Never rendered: the guard always redirects. */
@Component({
  selector: 'app-docs-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export default class DocsIndexPage {}
