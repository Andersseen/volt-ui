import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CountUp } from './count-up';

function reducedMotion(reduce: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    query =>
      ({
        matches: reduce && query.includes('reduce'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList
  );
}

describe('count up', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows the real value straight away under reduced motion', async () => {
    reducedMotion(true);
    await render(CountUp, { componentInputs: { to: 831 } });

    expect(screen.getByText('831')).toBeInTheDocument();
  });

  it('waits at its starting value until it scrolls into view', async () => {
    reducedMotion(false);
    const { fixture } = await render(CountUp, { componentInputs: { to: 0, from: 120 } });
    await fixture.whenStable();

    expect(screen.getByText('120')).toBeInTheDocument();
  });
});
