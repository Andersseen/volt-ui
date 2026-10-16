import { computed, Directive, input } from '@angular/core';
import { NgpBreadcrumbLink } from 'ng-primitives/breadcrumbs';
import { cn } from '../../utils';
import { BREADCRUMB_LINK_CLASSES } from './breadcrumbs-link-variants';

/**
 * Breadcrumb link styles on a native `<a>`, so the element you write is the element that is
 * focused, named and navigated — which is what lets a router directive own the navigation:
 *
 * ```html
 * <a voltBreadcrumbLink href="/docs">Docs</a>
 * <a voltBreadcrumbLink routerLink="/admin" [queryParams]="{ tab: 'users' }">Admin</a>
 * <a voltBreadcrumbLink [routerLink]="['/admin', collection]">Collection</a>
 * ```
 *
 * Volt does not import the router: `routerLink`, `href`, `target`, `rel`, `fragment` and
 * `aria-current` are yours and stay on the anchor. Use `<volt-breadcrumb-link href>` when a plain
 * URL is all you need; use this when the anchor itself has to belong to you.
 */
@Directive({
  selector: 'a[voltBreadcrumbLink]',
  hostDirectives: [NgpBreadcrumbLink],
  host: {
    '[class]': 'classes()',
  },
})
export class VoltNativeBreadcrumbLink {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn(BREADCRUMB_LINK_CLASSES, this.class()));
}
