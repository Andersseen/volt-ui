import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltPagination } from './pagination';

@Component({
  selector: 'app-pagination-test-wrapper',
  imports: [VoltPagination],
  template: `<volt-pagination [page]="page()" [pageCount]="pageCount()" [disabled]="disabled()" />`,
})
class PaginationTestWrapper {
  readonly page = input<number>(1);
  readonly pageCount = input<number>(5);
  readonly disabled = input(false);
}

describe('VoltPagination', () => {
  it('should render pagination container', async () => {
    const { container } = await render(PaginationTestWrapper);

    const pagination = container.querySelector('volt-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should mark pagination as disabled when input is set', async () => {
    const { container } = await render(PaginationTestWrapper, {
      componentInputs: { disabled: true },
    });

    const pagination = container.querySelector('volt-pagination');
    expect(pagination).toHaveAttribute('data-disabled');
  });
});
