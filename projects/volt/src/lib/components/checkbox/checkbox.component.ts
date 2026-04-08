import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  selector: 'volt-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpCheckbox],
  template: `
    <button
      ngpCheckbox
      [ngpCheckboxChecked]="checked()"
      [ngpCheckboxDisabled]="disabled()"
      [ngpCheckboxRequired]="required()"
      (ngpCheckboxCheckedChange)="checked.set($event)"
      class="peer flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked=true]:bg-primary data-[checked=true]:text-primary-foreground"
    >
      @if (checked()) {
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      }
    </button>
  `,
})
export class VoltCheckbox {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly required = input(false);
}
