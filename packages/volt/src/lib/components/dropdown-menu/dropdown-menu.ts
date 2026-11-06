import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpMenu } from 'ng-primitives/menu';
import { cn } from '../../utils';
import { VoltThemeInherit } from '../theme/theme-scope';

@Component({
  selector: 'volt-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMenu, VoltThemeInherit],
  host: {
    role: 'menu',
    '(keydown)': 'stopEscapePropagation($event)',
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltDropdownMenu {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'fixed z-50 min-w-[8rem] overflow-hidden rounded-md border-(length:--border-width) border-border bg-popover p-1 text-popover-foreground shadow-md',
      this.class()
    )
  );

  protected stopEscapePropagation(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  }
}
