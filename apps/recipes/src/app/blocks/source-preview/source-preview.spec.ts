import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SourcePreview } from './source-preview';

const sourceText = () => screen.getByLabelText('Notice source').textContent!;

describe('SourcePreview', () => {
  it('shows the first notice as both source and result', async () => {
    await render(SourcePreview);

    expect(sourceText()).toContain("title: 'Deployed to production'");
    expect(sourceText()).toContain("tone: 'success'");
    expect(
      screen.getByText('Deployed to production', { selector: 'volt-alert-title' })
    ).toBeInTheDocument();
  });

  it('rewrites the source and the card together when another notice is picked', async () => {
    await render(SourcePreview);

    await userEvent.click(screen.getByRole('radio', { name: 'Outage' }));

    expect(sourceText()).toContain("title: 'Payments are degraded'");
    expect(sourceText()).toContain("tone: 'destructive'");
    expect(
      screen.getByText('Payments are degraded', { selector: 'volt-alert-title' })
    ).toBeInTheDocument();
    expect(screen.getByText('We are investigating failed card charges.')).toBeInTheDocument();
  });

  it('prints an action line only when the notice has one — and shows the button only then', async () => {
    await render(SourcePreview);
    expect(sourceText()).toContain("action: 'View release'");
    expect(screen.getByRole('button', { name: 'View release' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Outage' }));
    expect(sourceText()).not.toContain('action:');
    expect(screen.queryByRole('button', { name: 'View release' })).not.toBeInTheDocument();
  });

  it('announces the result politely and lets the source be reached from the keyboard', async () => {
    await render(SourcePreview);

    expect(screen.getByLabelText('Notice source')).toHaveAttribute('tabindex', '0');
    expect(document.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});
