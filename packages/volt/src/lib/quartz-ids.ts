import { Injectable } from '@angular/core';

/*
 * Application-scoped id source for the Quartz wrappers. Quartz 0.16.0 numbers its own ids with a
 * module-level counter that lives as long as the JS realm, so on a server it keeps counting across
 * requests and never matches the browser's count. This service is created per Angular application
 * (per SSR request, per browser tab), so server and client count the same sequence of components
 * and produce the same ids.
 */
@Injectable({ providedIn: 'root' })
export class VoltQuartzIds {
  private next = 0;

  generate(prefix: string): string {
    return `${prefix}-${++this.next}`;
  }
}

/**
 * Replaces the ids a Quartz directive generated for itself. Tabs and Accordion cross-reference
 * their parts (`aria-controls`, `aria-labelledby`) through the directives' own `id`/`panelId`
 * fields, which Quartz 0.16.0 fills from module-level counters. Assigning here, in the wrapper's
 * constructor, runs before Quartz registers the part (`ngOnInit`) and before any host binding is
 * evaluated, so the replaced id is the only one that ever reaches the DOM or the other parts —
 * nothing is patched after render. The fields are `readonly` in Quartz's typings only.
 */
export function replaceQuartzIds(
  directive: { readonly id: string },
  ids: { id: string; panelId?: string }
): void {
  Object.assign(directive, ids);
}
