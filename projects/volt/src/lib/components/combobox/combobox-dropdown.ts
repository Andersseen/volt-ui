import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpComboboxDropdown } from 'ng-primitives/combobox';

@Component({
  selector: 'volt-combobox-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpComboboxDropdown,
      inputs: ['id'],
    },
  ],
  host: {
    class:
      'relative z-50 w-full min-w-[var(--ngp-combobox-dropdown-width)] overflow-hidden rounded-[var(--radius-md)] border border-input bg-background p-1 shadow-[var(--shadow-md)]',
  },
  template: `<ng-content />`,
})
export class VoltComboboxDropdown {}
