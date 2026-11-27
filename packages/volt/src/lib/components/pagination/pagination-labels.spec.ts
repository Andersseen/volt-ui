import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { VoltPagination } from './pagination';
import { VoltPaginationFirst } from './pagination-first';
import { VoltPaginationLast } from './pagination-last';
import { VoltPaginationNext } from './pagination-next';
import { VoltPaginationPrevious } from './pagination-previous';

@Component({
  imports: [
    VoltPagination,
    VoltPaginationFirst,
    VoltPaginationPrevious,
    VoltPaginationNext,
    VoltPaginationLast,
  ],
  template: `
    <volt-pagination [page]="2" [pageCount]="5">
      <volt-pagination-first />
      <volt-pagination-previous />
      <volt-pagination-next />
      <volt-pagination-last />
    </volt-pagination>
  `,
})
class EnglishDefaults {}

@Component({
  imports: [
    VoltPagination,
    VoltPaginationFirst,
    VoltPaginationPrevious,
    VoltPaginationNext,
    VoltPaginationLast,
  ],
  template: `
    <volt-pagination [page]="2" [pageCount]="5">
      <volt-pagination-first label="Primera página" />
      <volt-pagination-previous label="Página anterior" />
      <volt-pagination-next label="Наступна сторінка" />
      <volt-pagination-last label="Остання сторінка" />
    </volt-pagination>
  `,
})
class Localized {}

/** The icon-only page buttons carry their own name; an app in another language must set it. */
describe('Pagination navigation names', () => {
  it('keep their English defaults', async () => {
    await render(EnglishDefaults);
    for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('take a translated name through label', async () => {
    await render(Localized);
    for (const name of [
      'Primera página',
      'Página anterior',
      'Наступна сторінка',
      'Остання сторінка',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();
  });
});
