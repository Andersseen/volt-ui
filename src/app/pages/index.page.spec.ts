import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SITE_STATS } from '../lib/generated/site-stats';
import Home from './index.page';

describe('official landing page', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('presents the product, proof points and primary journeys', async () => {
    await render(Home, { providers: [provideRouter([])] });

    expect(
      screen.getByRole('heading', {
        name: 'Ship Angular interfaces from components you can own.',
      })
    ).toBeInTheDocument();
    // Asserted against the generated stats rather than literals, so the page and the
    // repo can never disagree the way hand-written numbers did.
    expect(screen.getAllByText(`${SITE_STATS.components}`).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(`${SITE_STATS.tests}`).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(`${SITE_STATS.themeCombos}`).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Start building' })).toBeInTheDocument();
    expect(screen.getAllByText('Browse components').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('heading', { name: 'Own the source' })).toBeInTheDocument();
  });

  it('routes the secondary hero call to action to the theme studio', async () => {
    await render(Home, { providers: [provideRouter([])] });

    const themeStudio = screen.getByRole('button', { name: 'Try the theme studio' });
    expect(themeStudio).toBeInTheDocument();
    expect(themeStudio.closest('volt-button')?.getAttribute('routerlink')).toBe('/create-theme');
  });

  it('copies the CLI command and exposes a temporary success label', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const { fixture } = await render(Home, { providers: [provideRouter([])] });
    await (
      fixture.componentInstance as unknown as { copyInstallCommand(): Promise<void> }
    ).copyInstallCommand();
    fixture.detectChanges();
    expect(writeText).toHaveBeenCalledWith('npx @voltui/cli add button dialog form-field');
    expect(screen.getByRole('button', { name: 'Command copied' })).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1800);
    fixture.detectChanges();
    expect(screen.getByRole('button', { name: 'Copy install command' })).toBeInTheDocument();
  });
});
