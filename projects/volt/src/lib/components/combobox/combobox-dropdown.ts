import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpComboboxDropdown } from 'ng-primitives/combobox';

let nextComboboxDropdownId = 0;

@Component({
  selector: 'volt-combobox-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpComboboxDropdown],
  host: {
    class: 'contents',
  },
  template: `
    <div
      ngpComboboxDropdown
      [id]="id()"
      class="absolute z-50 min-w-[var(--ngp-combobox-width)] max-w-[var(--ngp-combobox-width)] w-full overflow-hidden rounded-md border border-input bg-background p-1 shadow-md"
    >
      <ng-content />
    </div>
  `,
})
export class VoltComboboxDropdown {
  readonly id = input(`volt-combobox-dropdown-${++nextComboboxDropdownId}`);
}
