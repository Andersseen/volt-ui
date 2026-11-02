import { Injectable, type Signal } from '@angular/core';

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
 * Replaces the ids a Quartz directive generated for itself. Tabs, Accordion, Listbox and Select
 * cross-reference their parts (`aria-controls`, `aria-labelledby`, `aria-activedescendant`)
 * through fields (`id`, `panelId`, `labelId`) that Quartz 0.16.0 fills from module-level counters.
 * Assigning here, in the wrapper's constructor, runs before Quartz registers the part (`ngOnInit`)
 * and before any host binding is evaluated, so the replaced id is the only one that ever reaches
 * the DOM or the other parts — nothing is patched after render. The fields are `readonly` in
 * Quartz's typings only.
 */
export function replaceQuartzIds(directive: object, ids: Readonly<Record<string, string>>): void {
  Object.assign(directive, ids);
}

/**
 * Replaces a signal input of a Quartz host directive that the wrapper deliberately does not expose
 * (its Volt input has another name or shape, e.g. `mode: 'single' | 'multiple'` for Quartz's
 * `multiple: boolean`). Angular never writes an unexposed host-directive input, so the field is
 * free to be a Volt-owned signal; the directive reads it as it would its own input.
 */
export function overrideQuartzInput<T>(directive: object, name: string, source: Signal<T>): void {
  Object.defineProperty(directive, name, { value: source, configurable: true, writable: true });
}
