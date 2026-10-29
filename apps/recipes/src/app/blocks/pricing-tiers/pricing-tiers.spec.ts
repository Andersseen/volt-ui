import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PricingTiers } from './pricing-tiers';

describe('PricingTiers', () => {
  it('starts on annual billing and shows the discounted prices', async () => {
    await render(PricingTiers);

    expect(screen.getByRole('switch', { name: /bill annually/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByText('$19')).toBeInTheDocument();
    expect(screen.getByText('$63')).toBeInTheDocument();
  });

  it('swaps every price when the billing period is switched', async () => {
    const user = userEvent.setup();
    await render(PricingTiers);

    await user.click(screen.getByRole('switch', { name: /bill annually/i }));

    expect(screen.getByText('$24')).toBeInTheDocument();
    expect(screen.getByText('$79')).toBeInTheDocument();
    expect(screen.queryByText('$19')).not.toBeInTheDocument();
  });

  it('shows the yearly total only for paid plans on annual billing', async () => {
    const user = userEvent.setup();
    await render(PricingTiers);

    expect(screen.getByText(/billed \$228 yearly/i)).toBeInTheDocument();
    // The free tier never gets one — "billed $0 yearly" would be noise.
    expect(screen.queryByText(/billed \$0 yearly/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: /bill annually/i }));

    expect(screen.queryByText(/yearly/i)).not.toBeInTheDocument();
  });

  it('points both labels at the switch itself, not at the custom element wrapping it', async () => {
    const { fixture } = await render(PricingTiers);
    const host = fixture.nativeElement as HTMLElement;

    const labels = host.querySelectorAll<HTMLLabelElement>('label[for="billing-period"]');
    const target = host.querySelector('#billing-period');

    expect(labels).toHaveLength(2);
    // A <label for> that resolves to <volt-switch> would silently do nothing on click.
    expect(target?.tagName).toBe('BUTTON');
  });

  it('flips the label emphasis with the period, so the active one is not colour-only', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(PricingTiers);
    const host = fixture.nativeElement as HTMLElement;
    const [monthly, annual] = host.querySelectorAll<HTMLLabelElement>(
      'label[for="billing-period"]'
    );

    expect(annual.className).toContain('font-medium');
    expect(monthly.className).not.toContain('font-medium');

    await user.click(screen.getByRole('switch', { name: /bill annually/i }));

    expect(monthly.className).toContain('font-medium');
    expect(annual.className).not.toContain('font-medium');
  });
});
