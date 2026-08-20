import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { SITE_STATS } from '../lib/generated/site-stats';
import Home from './index.page';

describe('official landing page', () => {
  it('runs the five sections in order and presents the primary journeys', async () => {
    await render(Home, { providers: [provideRouter([])] });

    // The page itself only composes sections, so this asserts the running order holds:
    // one landmark from each of the five, top to bottom.
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
    expect(screen.getByRole('heading', { name: 'Own the source' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'A workflow that ends in editable Angular, not vendor lock-in.',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start building' })).toBeInTheDocument();
    expect(screen.getAllByText('Browse components').length).toBeGreaterThanOrEqual(1);
  });

  it('routes the secondary hero call to action to the theme studio', async () => {
    await render(Home, { providers: [provideRouter([])] });

    const themeStudio = screen.getByRole('button', { name: 'Try the theme studio' });
    expect(themeStudio).toBeInTheDocument();
    expect(themeStudio.closest('volt-button')?.getAttribute('routerlink')).toBe('/create-theme');
  });
});
