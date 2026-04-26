import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpComboboxButton } from 'ng-primitives/combobox';

@Component({
  selector: 'volt-combobox-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpComboboxButton,
      inputs: ['id'],
    },
  ],
  host: {
    class:
      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  },
  template: `
    <button type="button" class="inline-flex items-center justify-center">
      <ng-content />
    </button>
  `,
})
export class VoltComboboxButton {}
