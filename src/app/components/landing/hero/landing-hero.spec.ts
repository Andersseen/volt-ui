import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INSTALL_COMMAND, InstallCommand } from './install-command';
import { LandingHero } from './landing-hero';

describe('landing hero', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('advertises the same install command its copy button writes', async () => {
    await render(LandingHero, { providers: [provideRouter([])] });

    expect(screen.getByText(INSTALL_COMMAND)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy the install command' })).toBeInTheDocument();
  });

  it('copies the CLI command and exposes a temporary success label', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    const { fixture } = await render(InstallCommand);
    await fixture.componentInstance.copy();
    fixture.detectChanges();
    expect(writeText).toHaveBeenCalledWith(INSTALL_COMMAND);
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1800);
    fixture.detectChanges();
    expect(screen.getByRole('button', { name: 'Copy the install command' })).toBeInTheDocument();
  });

  it('shows the source next to the real component, and keeps them in step', async () => {
    const user = userEvent.setup();
    const { container } = await render(LandingHero, { providers: [provideRouter([])] });
    const card = container.querySelector('.hero-source')!;

    expect(card.querySelector('pre')).toHaveTextContent('<volt-button variant="solid">');
    expect(card.querySelector('.stage volt-button')).not.toBeNull();

    await user.click(screen.getByRole('radio', { name: 'outline' }));
    expect(card.querySelector('pre')).toHaveTextContent('variant="outline"');
    expect(card.querySelector('.stage volt-button button')).toHaveClass('border-input');

    await user.click(screen.getByRole('radio', { name: 'switch' }));
    expect(card.querySelector('pre')).toHaveTextContent('[checked]="true"');
    expect(card.querySelector('.stage volt-switch')).not.toBeNull();
    expect(card).toHaveTextContent('npx @voltui/cli add switch');
  });

  it('draws the threads behind the hero, hidden from assistive tech', async () => {
    const { container } = await render(LandingHero, { providers: [provideRouter([])] });

    expect(container.querySelector('app-volt-threads')).toHaveAttribute('aria-hidden', 'true');
  });
});
