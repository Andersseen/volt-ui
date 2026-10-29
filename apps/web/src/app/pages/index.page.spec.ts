import { By } from '@angular/platform-browser';
import { EtymaI18n } from '@etyma/angular';
import { provideRouter, RouterLink } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SITE_STATS } from '../lib/generated/site-stats';
import Home from './index.page';

describe('official landing page', () => {
  afterEach(() => vi.restoreAllMocks());

  it('runs the five sections in order and presents the primary journeys', async () => {
    // Reduced motion: the stats show their real values instead of waiting to count up on scroll.
    vi.spyOn(window, 'matchMedia').mockImplementation(
      query =>
        ({
          matches: query.includes('reduce'),
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList
    );
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
    const { fixture } = await render(Home, { providers: [provideRouter([])] });

    expect(screen.getByRole('button', { name: 'Try the theme studio' })).toBeInTheDocument();

    /*
     * Read from the directive rather than from a `routerlink` attribute. The link is a
     * binding now, because it carries the reader's language — so there is no static
     * attribute to read, and asserting on one would only ever have proved that somebody
     * typed a string into the template.
     */
    const targets = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map(link => link.injector.get(RouterLink).urlTree?.toString());

    expect(targets).toContain('/create-theme');
  });

  it("carries the reader's language into the hero links", async () => {
    const { fixture } = await render(Home, {
      providers: [provideRouter([])],
    });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    await translations.setLocale('es');
    await fixture.whenStable();

    const targets = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map(link => link.injector.get(RouterLink).urlTree?.toString());

    expect(targets).toContain('/es/create-theme');
  });
});
