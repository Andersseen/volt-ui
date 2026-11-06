import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-dropdown-menu-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltDropdownMenuLabel {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('px-inset-xs py-item-y text-xs font-semibold text-muted-foreground', this.class())
  );
}
