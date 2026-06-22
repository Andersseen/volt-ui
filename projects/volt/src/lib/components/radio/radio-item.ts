import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpRadioItem, NgpRadioIndicator } from 'ng-primitives/radio';

@Component({
  selector: 'volt-radio-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpRadioItem, NgpRadioIndicator],
  host: {
    class: 'flex items-center gap-2',
  },
  template: `
    <button
      ngpRadioItem
      [ngpRadioItemValue]="value()"
      [ngpRadioItemDisabled]="disabled()"
      class="peer relative flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary"
    >
      <span ngpRadioIndicator class="items-center justify-center hidden data-[checked]:flex">
        <span class="h-2.5 w-2.5 rounded-full bg-primary"></span>
      </span>
    </button>
    <span
      class="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
    >
      <ng-content />
    </span>
  `,
})
export class VoltRadioItem {
  readonly value = input.required<string>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}
