import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-dropdown-menu-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    role: 'separator',
  },
  template: ``,
})
export class VoltDropdownMenuSeparator {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('-mx-1 my-1 h-px bg-border', this.class()));
}
