import { ChangeDetectionStrategy, Component, computed, contentChild, input } from '@angular/core';
import { cn } from '../../utils';
import { VoltTableCaption } from './table-caption';

@Component({
  selector: 'volt-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    role: 'table',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'labelledBy()',
  },
  template: `<ng-content />`,
})
export class VoltTable {
  readonly class = input<string>('');
  /** A name for the table. Without one (and without `aria-labelledby`) the caption names it. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  // A native <caption> names its table; role="caption" on a custom element does not, so the
  // relationship is written explicitly.
  private readonly caption = contentChild(VoltTableCaption);

  protected readonly labelledBy = computed(
    () => this.ariaLabelledby() || (this.ariaLabel() ? null : (this.caption()?.id() ?? null))
  );

  protected readonly classes = computed(() =>
    cn('table w-full caption-bottom text-sm border-collapse', this.class())
  );
}
