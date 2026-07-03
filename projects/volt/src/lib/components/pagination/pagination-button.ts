import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { NgpPaginationButton } from 'ng-primitives/pagination';
import { paginationButtonVariants, type PaginationButtonVariants } from './variants';

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
