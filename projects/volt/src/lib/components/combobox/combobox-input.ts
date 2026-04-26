import { Directive } from '@angular/core';
import { NgpComboboxInput } from 'ng-primitives/combobox';

@Directive({
  selector: 'input[voltComboboxInput]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpComboboxInput,
      inputs: ['id'],
    },
  ],
  host: {
    class:
      'flex h-9 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  },
})
export class VoltComboboxInput {}
