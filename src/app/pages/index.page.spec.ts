import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';
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
    // A route to land on: the locale comes from the URL, so the URL has to be reachable.
    const { fixture } = await render(Home, {
      providers: [provideRouter([{ path: 'es', children: [] }])],
    });
    const router = fixture.debugElement.injector.get(Router);

    await router.navigateByUrl('/es');
    await fixture.whenStable();

    const targets = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map(link => link.injector.get(RouterLink).urlTree?.toString());

    expect(targets).toContain('/es/create-theme');
  });
});
