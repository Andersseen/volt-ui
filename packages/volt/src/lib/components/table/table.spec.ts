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

@Component({
  imports: [VoltTable, VoltTableCaption, VoltTableBody, VoltTableRow, VoltTableCell],
  template: `
    <volt-table>
      <volt-table-caption>Recent invoices</volt-table-caption>
      <volt-table-body>
        <volt-table-row><volt-table-cell>INV001</volt-table-cell></volt-table-row>
      </volt-table-body>
    </volt-table>
    <span id="external-name">Ledger</span>
    <volt-table aria-labelledby="external-name">
      <volt-table-caption>Ignored caption</volt-table-caption>
    </volt-table>
    <volt-table aria-label="Named by label">
      <volt-table-caption>Also ignored</volt-table-caption>
    </volt-table>
    <volt-table data-testid="bare"></volt-table>
  `,
})
class CaptionNameHost {}

describe('table caption names the table', () => {
  // A native <caption> names its <table>; role="caption" on a custom element does not (ARIA 1.2),
  // so without this a captioned Volt table was announced as an unnamed table.
  it('a caption names the table; the consumer’s own aria-label / aria-labelledby wins', async () => {
    await render(CaptionNameHost);
    expect(screen.getByRole('table', { name: 'Recent invoices' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Ledger' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Named by label' })).toBeInTheDocument();
    const bare = screen.getByTestId('bare');
    expect(bare).not.toHaveAttribute('aria-labelledby');
    expect(bare).not.toHaveAttribute('aria-label');
  });
});
