import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

/**
 * Empty-state heading. It is text, not a heading element, so it does not add an entry to the page
 * outline; wrap it in `<h2>`…`<h6>` yourself if the empty state is a section of the page.
 */
@Component({
  selector: 'volt-empty-state-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltEmptyStateTitle {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block text-balance text-base font-semibold leading-snug tracking-tight', this.class())
  );
}
