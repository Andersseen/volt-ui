import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  numberAttribute,
  computed,
} from '@angular/core';
import { NgpPagination, providePaginationState } from 'ng-primitives/pagination';
import { cn } from '../../utils';

@Component({
  selector: 'volt-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [providePaginationState()],
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [
    {
      directive: NgpPagination,
      inputs: [
        'ngpPaginationPage: page',
        'ngpPaginationPageCount: pageCount',
        'ngpPaginationDisabled: disabled',
      ],
      outputs: ['ngpPaginationPageChange: pageChange'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltPagination {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('flex w-full items-center justify-center gap-1', this.class())
  );

  readonly page = model<number>(1);
  readonly pageCount = input<number, number>(0, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}
