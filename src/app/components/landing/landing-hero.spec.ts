import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INSTALL_COMMAND, LandingHero } from './landing-hero';

describe('landing hero', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('advertises the same install command its copy button writes', async () => {
    await render(LandingHero, { providers: [provideRouter([])] });

    expect(screen.getByText(INSTALL_COMMAND)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy install command' })).toBeInTheDocument();
  });

  it('copies the CLI command and exposes a temporary success label', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const { fixture } = await render(LandingHero, { providers: [provideRouter([])] });
    await fixture.componentInstance.copyInstallCommand();
    fixture.detectChanges();
    expect(writeText).toHaveBeenCalledWith(INSTALL_COMMAND);
    expect(screen.getByRole('button', { name: 'Command copied' })).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1800);
    fixture.detectChanges();
    expect(screen.getByRole('button', { name: 'Copy install command' })).toBeInTheDocument();
  });

  it('builds the showcase panel out of real Volt components', async () => {
    const { container } = await render(LandingHero, { providers: [provideRouter([])] });

    // The panel's whole argument is that it is the library rather than a picture of it.
    const showcase = container.querySelector('.hero-showcase')!;
    expect(showcase.querySelector('volt-input')).not.toBeNull();
    expect(showcase.querySelector('volt-switch')).not.toBeNull();
    expect(showcase.querySelector('volt-slider')).not.toBeNull();
  });
});
