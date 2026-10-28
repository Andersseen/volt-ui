import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltSearch } from './search';
import { VoltSearchClear } from './search-clear';

@Component({
  selector: 'app-search-test-wrapper',
  imports: [VoltSearch],
  template: `
    <volt-search>
      <input type="search" placeholder="Search..." />
    </volt-search>
  `,
})
class SearchTestWrapper {}

@Component({
  imports: [VoltSearch, VoltSearchClear],
  template: `
    <volt-search>
      <input type="search" placeholder="Search..." />
      <volt-search-clear>Clear</volt-search-clear>
    </volt-search>
  `,
})
class SearchClearTestWrapper {}

describe('VoltSearch', () => {
  it('should render search wrapper', async () => {
    const { container } = await render(SearchTestWrapper);

    const search = container.querySelector('volt-search');
    expect(search).toBeInTheDocument();
    expect(search).toHaveClass('relative');
    expect(search).toHaveClass('w-full');
  });

  it('should render clear control with button primitive states and empty styling', async () => {
    const { container } = await render(SearchClearTestWrapper);

    const clear = container.querySelector('volt-search-clear button');
    expect(clear).toHaveAttribute('ngpButton');
    expect(clear).toHaveClass('data-[empty]:hidden');
  });
});
