import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { cn } from '../../utils';

@Component({
  selector: 'volt-table-caption',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[id]': 'id()',
    role: 'caption',
  },
  template: `<ng-content />`,
})
export class VoltTableCaption {
  readonly class = input<string>('');
  /** The caption's id; the parent `volt-table` points `aria-labelledby` at it. */
  readonly id = input<string>(uniqueId('volt-table-caption'));

  protected readonly classes = computed(() =>
    cn('table-caption mt-4 text-sm text-muted-foreground', this.class())
  );
}
