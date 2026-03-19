import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  selector: 'volt-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpCheckbox,
      inputs: [
        'ngpCheckboxChecked: checked',
        'ngpCheckboxDisabled: disabled',
        'ngpCheckboxRequired: required',
      ],
      outputs: ['ngpCheckboxCheckedChange: checkedChange'],
    },
  ],
  host: {
    class:
      'peer flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked=true]:bg-primary data-[checked=true]:text-primary-foreground',
  },
  template: `
    @if (checkbox.checked()) {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-3 w-3"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    }
  `,
})
export class VoltCheckbox {
  protected readonly checkbox = inject(NgpCheckbox);
}
