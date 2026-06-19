import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { NgpPaginationButton } from 'ng-primitives/pagination';
import { cva, type VariantProps } from 'class-variance-authority';

export const paginationButtonVariants = cva(
  'inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground data-[selected]:border-primary data-[selected]:bg-primary data-[selected]:text-primary-foreground',
        outline: 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type PaginationButtonVariants = VariantProps<typeof paginationButtonVariants>;

@Component({
  selector: 'volt-pagination-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpPaginationButton],
  host: {
    class: 'inline-flex',
  },
  template: `
    <button
      ngpPaginationButton
      [ngpPaginationButtonPage]="page()"
      [ngpPaginationButtonDisabled]="disabled()"
      [class]="classes()"
      type="button"
    >
      {{ page() }}
    </button>
  `,
})
export class VoltPaginationButton {
  readonly page = input.required<number, number>({ transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly variant = input<PaginationButtonVariants['variant']>('default');

  protected readonly classes = computed(() =>
    paginationButtonVariants({ variant: this.variant() })
  );
}
