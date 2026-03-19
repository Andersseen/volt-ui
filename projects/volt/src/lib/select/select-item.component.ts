import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpSelectOption } from 'ng-primitives/select';

@Component({
  selector: 'volt-select-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpSelectOption,
      inputs: ['ngpSelectOptionValue: value', 'ngpSelectOptionDisabled: disabled'],
    },
  ],
  host: {
    class:
      'group relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-muted focus:text-muted-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50 transition-colors',
  },
  template: `
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4 hidden group-data-[selected]:block"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
    <ng-content></ng-content>
  `,
})
export class VoltSelectItem {
  readonly value = input<unknown>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
}
