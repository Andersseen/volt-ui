import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltSearch } from './search';

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

describe('VoltSearch', () => {
  it('should render search wrapper', async () => {
    const { container } = await render(SearchTestWrapper);

    const search = container.querySelector('volt-search');
    expect(search).toBeInTheDocument();
    expect(search).toHaveClass('relative');
    expect(search).toHaveClass('w-full');
  });
});
