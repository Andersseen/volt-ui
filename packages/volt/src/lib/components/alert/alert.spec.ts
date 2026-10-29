import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltAlert, VoltAlertDescription, VoltAlertTitle } from './';

const ALL = [VoltAlert, VoltAlertTitle, VoltAlertDescription];

describe('VoltAlert', () => {
  it('renders title, description, icon and action slots in order', async () => {
    const { container } = await render(
      `<volt-alert variant="warning">
        <svg slot="icon" data-testid="icon" aria-hidden="true"></svg>
        <volt-alert-title>Connection needs attention</volt-alert-title>
        <volt-alert-description>Reconnect your Cloudflare account.</volt-alert-description>
        <button slot="action">Reconnect</button>
      </volt-alert>`,
      { imports: ALL }
    );

    const alert = container.querySelector('volt-alert')!;
    expect(alert.firstElementChild).toBe(screen.getByTestId('icon'));
    expect(alert.lastElementChild).toBe(screen.getByRole('button', { name: 'Reconnect' }));
    expect(screen.getByText('Connection needs attention')).toBeInTheDocument();
    expect(screen.getByText('Reconnect your Cloudflare account.')).toBeInTheDocument();
  });

  it('has no live-region role by default', async () => {
    const { container } = await render(`<volt-alert>Static notice</volt-alert>`, {
      imports: ALL,
    });

    expect(container.querySelector('volt-alert')).not.toHaveAttribute('role');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it.each(['status', 'alert'] as const)('opts into role="%s"', async role => {
    await render(`<volt-alert role="${role}">Saved</volt-alert>`, { imports: ALL });

    expect(screen.getByRole(role)).toHaveTextContent('Saved');
  });

  it.each([
    ['default', 'bg-surface'],
    ['info', 'bg-info/10'],
    ['success', 'bg-success/10'],
    ['warning', 'bg-warning/10'],
    ['destructive', 'bg-destructive/10'],
  ])('applies the %s variant with semantic tokens', async (variant, bg) => {
    const { container } = await render(`<volt-alert variant="${variant}">x</volt-alert>`, {
      imports: ALL,
    });
    const alert = container.querySelector('volt-alert')!;

    expect(alert).toHaveClass(bg);
    expect(alert).toHaveAttribute('data-variant', variant);
  });

  it('does not colour the warning icon with a token that fails contrast', async () => {
    const { container } = await render(`<volt-alert variant="warning">x</volt-alert>`, {
      imports: ALL,
    });

    expect(container.querySelector('volt-alert')!.className).not.toMatch(/text-warning/);
  });
});
