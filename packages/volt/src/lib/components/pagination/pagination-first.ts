import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { NgpPaginationFirst } from 'ng-primitives/pagination';
import { cn } from '../../utils';

@Component({
  selector: 'volt-pagination-first',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpPaginationFirst],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <button
      ngpPaginationFirst
      [ngpPaginationFirstDisabled]="disabled()"
      class="inline-flex h-control-dense w-control-dense items-center justify-center rounded-md border-(length:--volt-control-border-width) border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
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
        <path d="m11 17-5-5 5-5" />
        <path d="m18 17-5-5 5-5" />
      </svg>
      <span class="sr-only">First page</span>
    </button>
  `,
})
export class VoltPaginationFirst {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('inline-flex', this.class()));

  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}
