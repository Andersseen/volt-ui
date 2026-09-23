import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-table-caption',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    role: 'caption',
  },
  template: `<ng-content />`,
})
export class VoltTableCaption {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('table-caption mt-4 text-sm text-muted-foreground', this.class())
  );
}
