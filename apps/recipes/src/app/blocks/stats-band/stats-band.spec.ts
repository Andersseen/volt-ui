import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { StatsBand } from './stats-band';

describe('StatsBand', () => {
  it('pairs each figure with its label in a description list', async () => {
    const { fixture } = await render(StatsBand);
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelectorAll('dt')).toHaveLength(4);
    expect(host.querySelectorAll('dd')).toHaveLength(4);
    expect(screen.getByText('Uptime')).toBeInTheDocument();
  });

  it('renders the final values, and gives screen readers only those', async () => {
    const { fixture } = await render(StatsBand);
    const host = fixture.nativeElement as HTMLElement;
    const values = Array.from(host.querySelectorAll('dd .sr-only')).map(node => node.textContent);

    expect(values).toEqual(['12.4M', '99.99%', '38 ms', '4.9/5']);
    for (const dd of host.querySelectorAll('dd')) {
      expect(dd.querySelector('[aria-hidden="true"]')).not.toBeNull();
    }
  });
});
