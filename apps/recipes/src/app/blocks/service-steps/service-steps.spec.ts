import { render, screen, within } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { ServiceSteps } from './service-steps';

describe('ServiceSteps', () => {
  it('is an ordered list of four steps, each with its duration and outcome', async () => {
    const { fixture } = await render(ServiceSteps);

    const list = (fixture.nativeElement as HTMLElement).querySelector('ol')!;
    const steps = within(list).getAllByRole('listitem');
    expect(steps).toHaveLength(4);
    expect(within(steps[0]).getByRole('heading', { name: 'Discover' })).toBeInTheDocument();
    expect(steps[0]).toHaveTextContent('Week 1');
    expect(steps[3]).toHaveTextContent('You get: a shipped feature your team owns.');
  });

  it('keeps the decorative line and numbers out of what is read', async () => {
    const { fixture } = await render(ServiceSteps);
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.track')).toHaveAttribute('aria-hidden', 'true');
    for (const marker of host.querySelectorAll('.marker')) {
      expect(marker).toHaveAttribute('aria-hidden', 'true');
    }
    expect(screen.getByRole('button', { name: 'Book a discovery call' })).toBeInTheDocument();
  });
});
