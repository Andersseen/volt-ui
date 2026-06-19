import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpPaginationPrevious } from 'ng-primitives/pagination';

@Component({
  selector: 'volt-pagination-previous',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpPaginationPrevious],
  host: {
    class: 'inline-flex',
  },
  template: `
    <button
      ngpPaginationPrevious
      [ngpPaginationPreviousDisabled]="disabled()"
      class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      <span class="sr-only">Previous page</span>
    </button>
  `,
})
export class VoltPaginationPrevious {
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}
