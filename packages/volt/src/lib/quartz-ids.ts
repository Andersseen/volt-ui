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
