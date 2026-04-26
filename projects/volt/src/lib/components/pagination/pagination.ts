import { ChangeDetectionStrategy, Component, input, model, numberAttribute } from '@angular/core';
import { NgpPagination, providePaginationState } from 'ng-primitives/pagination';

@Component({
  selector: 'volt-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [providePaginationState()],
  host: {
    class: 'flex w-full items-center justify-center gap-1',
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
  readonly page = model<number>(1);
  readonly pageCount = input<number, number>(0, { transform: numberAttribute });
  readonly disabled = input<boolean>(false);
}
