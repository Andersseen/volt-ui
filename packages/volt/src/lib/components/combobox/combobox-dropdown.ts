import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpComboboxDropdown } from 'ng-primitives/combobox';
import { cn } from '../../utils';

let nextComboboxDropdownId = 0;

@Component({
  selector: 'volt-combobox-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpComboboxDropdown],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <div
      ngpComboboxDropdown
      [id]="id()"
      class="absolute z-50 min-w-[var(--ngp-combobox-width)] max-w-[var(--ngp-combobox-width)] w-full overflow-hidden rounded-md border border-border bg-surface p-1 text-surface-foreground shadow-md"
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
