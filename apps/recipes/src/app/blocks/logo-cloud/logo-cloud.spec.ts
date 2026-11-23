import { render, screen, within } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { LogoCloud } from './logo-cloud';

describe('LogoCloud', () => {
  it('names every customer in a labelled list, with the marks hidden', async () => {
    await render(LogoCloud);

    const list = screen.getByRole('list', { name: 'Customers' });
    const logos = within(list).getAllByRole('listitem');
    expect(logos).toHaveLength(8);
    expect(logos[0]).toHaveTextContent('Northwind');
    for (const logo of logos) {
      expect(logo.querySelector('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it('staggers the entrance by each logo’s position', async () => {
    await render(LogoCloud);

    const logos = within(screen.getByRole('list', { name: 'Customers' })).getAllByRole('listitem');
    expect(logos[0].style.getPropertyValue('--i')).toBe('0');
    expect(logos[7].style.getPropertyValue('--i')).toBe('7');
  });
});
