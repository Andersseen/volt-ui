import { Injectable, signal } from '@angular/core';
import type { DistributionMode } from '../lib/distribution';

/**
 * The distribution mode a visitor picked (npm package or CLI copy), shared by every code panel of
 * both sites, so a choice made on one component, block or pattern page holds on the next page and
 * for a composition's supporting files.
 *
 * In memory only: the server always renders package mode, so SSR output and hydration never depend
 * on a stored preference.
 */
@Injectable({ providedIn: 'root' })
export class DistributionModeStore {
  private readonly current = signal<DistributionMode>('package');
  readonly mode = this.current.asReadonly();

  set(mode: DistributionMode): void {
    this.current.set(mode);
  }
}
