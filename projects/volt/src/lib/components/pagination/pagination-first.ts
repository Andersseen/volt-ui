import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpPaginationFirst } from 'ng-primitives/pagination';

@Component({
  selector: 'volt-pagination-first',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpPaginationFirst,
      inputs: ['ngpPaginationFirstDisabled: disabled'],
    },
  ],
  host: {
    class:
      'inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  },
  template: `
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
      <path d="m11 17-5-5 5-5" />
      <path d="m18 17-5-5 5-5" />
    </svg>
    <span class="sr-only">First page</span>
  `,
})
export class VoltPaginationFirst {
  readonly disabled = input<boolean>(false);
}
