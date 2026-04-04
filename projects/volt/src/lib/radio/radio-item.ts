import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import {
  NgpRadioItem,
  NgpRadioIndicator,
  injectRadioItemState,
  provideRadioItemState,
} from 'ng-primitives/radio';

@Component({
  selector: 'volt-radio-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpRadioItem, NgpRadioIndicator],
  providers: [provideRadioItemState()],
  host: {
    class: 'flex items-center gap-[var(--spacing-gap)]',
  },
  template: `
    <button
      ngpRadioItem
      [ngpRadioItemValue]="value()"
      [ngpRadioItemDisabled]="disabled()"
      [attr.data-state]="state().checked() ? 'checked' : 'unchecked'"
      class="peer relative flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--background)]"
    >
      <span
        ngpRadioIndicator
        class="flex items-center justify-center data-[state=unchecked]:hidden"
        [attr.data-state]="state().checked() ? 'checked' : 'unchecked'"
      >
        <span
          class="h-2.5 w-2.5 rounded-full bg-[var(--primary)] text-[var(--primary)] fill-[var(--primary)]"
        ></span>
      </span>
    </button>
    <label
      class="text-sm font-[var(--font-weight-label)] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
    >
      <ng-content />
    </label>
  `,
})
export class VoltRadioItem {
  readonly value = input.required<string>();
  readonly disabled = input<boolean>(false);
  protected readonly state = injectRadioItemState();
}
