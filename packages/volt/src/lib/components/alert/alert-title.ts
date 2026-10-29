import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

/**
 * Alert heading. It is text, not a heading element, so it does not add an entry to the page
 * outline; wrap it in `<h2>`…`<h6>` yourself if the alert is a section of the page.
 */
@Component({
  selector: 'volt-alert-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltAlertTitle {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block font-medium leading-snug tracking-tight', this.class())
  );
}
