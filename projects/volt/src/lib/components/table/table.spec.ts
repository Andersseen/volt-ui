import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import {
  VoltTable,
  VoltTableBody,
  VoltTableCaption,
  VoltTableCell,
  VoltTableFooter,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
} from './index';

@Component({
  imports: [
    VoltTable,
    VoltTableBody,
    VoltTableCaption,
    VoltTableCell,
    VoltTableFooter,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
  ],
  template: `
    <volt-table class="custom-table" aria-label="Accounts">
      <volt-table-caption>Accounts</volt-table-caption>
      <volt-table-header>
        <volt-table-row>
          <volt-table-head>Name</volt-table-head>
        </volt-table-row>
      </volt-table-header>
      <volt-table-body>
        <volt-table-row>
          <volt-table-cell>Ada</volt-table-cell>
        </volt-table-row>
      </volt-table-body>
      <volt-table-footer>
        <volt-table-row><volt-table-cell>Total: 1</volt-table-cell></volt-table-row>
      </volt-table-footer>
    </volt-table>
  `,
})
class TableFixture {}

describe('table components', () => {
  it('render semantic table roles and preserve consumer classes', async () => {
    await render(TableFixture);

    expect(screen.getByRole('table', { name: 'Accounts' })).toHaveClass('custom-table');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeInTheDocument();
    expect(screen.getAllByRole('rowgroup')).toHaveLength(3);
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});
