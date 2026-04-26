import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpComboboxOption } from 'ng-primitives/combobox';

@Component({
  selector: 'volt-combobox-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpComboboxOption,
      inputs: [
        'ngpComboboxOptionValue: value',
        'ngpComboboxOptionDisabled: disabled',
        'ngpComboboxOptionIndex: index',
      ],
      outputs: ['ngpComboboxOptionActivated: activated'],
    },
  ],
  host: {
    class:
      'relative flex w-full cursor-pointer select-none items-center rounded-[var(--radius-sm)] px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  },
  template: `<ng-content />`,
})
export class VoltComboboxOption {
  readonly value = input.required<unknown>();
  readonly disabled = input<boolean>(false);
  readonly index = input<number | undefined>();
}
