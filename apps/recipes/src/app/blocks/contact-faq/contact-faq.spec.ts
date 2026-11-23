import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ContactFaq } from './contact-faq';

describe('ContactFaq', () => {
  it('opens an answer from its question button', async () => {
    const user = userEvent.setup();
    await render(ContactFaq);
    const trigger = screen.getByRole('button', { name: 'Can I cancel at any time?' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('filters on question and answer text and announces the count', async () => {
    const user = userEvent.setup();
    await render(ContactFaq);

    await user.type(screen.getByRole('searchbox', { name: 'Search questions' }), 'csv');

    expect(screen.getAllByRole('button', { name: /\?$/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'How do I export my data?' })).toBeInTheDocument();
    expect(screen.getByText('1 question')).toHaveAttribute('aria-live', 'polite');
  });

  it('offers a person to ask when nothing matches', async () => {
    const user = userEvent.setup();
    await render(ContactFaq);

    await user.type(screen.getByRole('searchbox', { name: 'Search questions' }), 'kubernetes');

    expect(screen.getByText(/Nothing about “kubernetes” yet/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ask the team' })).toHaveAttribute(
      'href',
      'mailto:help@example.com'
    );
  });
});
