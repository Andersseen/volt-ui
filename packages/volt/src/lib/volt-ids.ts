import { inject, Injectable } from '@angular/core';

/*
 * Application-scoped source for the ids Volt components generate when the consumer gives none.
 *
 * A module-level counter lives as long as the JavaScript realm. On a server that is every request
 * the process ever renders, so the same page came out as `volt-checkbox-58` on one request and
 * `volt-checkbox-3` on the next, and never matched the browser's own count during hydration. This
 * service is created once per Angular application — per server request, per browser tab — so the
 * server and the client count the same components in the same order and produce the same ids.
 */
@Injectable({ providedIn: 'root' })
export class VoltIdSource {
  private readonly counts = new Map<string, number>();

  next(prefix: string): string {
    const count = (this.counts.get(prefix) ?? 0) + 1;
    this.counts.set(prefix, count);
    return `${prefix}-${count}`;
  }
}

/** A generated id unique within the current application. Call from an injection context. */
export function injectVoltId(prefix: string): string {
  return inject(VoltIdSource).next(prefix);
}
