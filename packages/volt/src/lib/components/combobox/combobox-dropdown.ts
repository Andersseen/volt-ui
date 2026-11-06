import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpComboboxDropdown } from 'ng-primitives/combobox';
import { cn } from '../../utils';
import { VoltThemeInherit } from '../theme/theme-scope';

let nextComboboxDropdownId = 0;

@Component({
  selector: 'volt-combobox-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpComboboxDropdown, VoltThemeInherit],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <div
      ngpComboboxDropdown
      voltThemeInherit
      [id]="id()"
      class="absolute z-50 min-w-[var(--ngp-combobox-width)] max-w-[var(--ngp-combobox-width)] w-full overflow-hidden rounded-md border-(length:--border-width) border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      <ng-content />
    </div>
  `,
})
export class VoltComboboxDropdown {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('contents', this.class()));

  readonly id = input(`volt-combobox-dropdown-${++nextComboboxDropdownId}`);
}
