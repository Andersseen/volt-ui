import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  numberAttribute,
  computed,
} from '@angular/core';
import {
  injectPaginationState,
  NgpPagination,
  providePaginationState,
} from 'ng-primitives/pagination';
import { mirrorValue } from '../../mirror-value';
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
      inputs: ['ngpPaginationPageCount: pageCount', 'ngpPaginationDisabled: disabled'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltPagination {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('flex w-full items-center justify-center gap-1', this.class())
  );

  /**
   * The current page. A static `page="3"` is the initial page; `[(page)]` keeps it in sync. Volt
   * owns it and mirrors it into the primitive without ever binding the primitive's own `page`
   * input, which would pin the component to the first value it was given (see mirror-value.ts).
   */
  readonly page = model<number>(1);
  readonly pageCount = input<number, number>(0, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  private readonly state = injectPaginationState();

  constructor() {
    mirrorValue(
      this.page,
      () => {
        const state = this.state();
        return {
          setValue: (page, options) => state.setPage(page, options),
          valueChange: state.pageChange,
        };
      },
      page => this.page.set(page)
    );
  }
}
