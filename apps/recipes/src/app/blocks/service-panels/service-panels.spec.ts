import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ServicePanels } from './service-panels';

// jsdom evaluates no container queries, so it always shows the stacked layout, where the
// full-card triggers are display: none. The open/folded contract is still the one under test.
describe('ServicePanels', () => {
  it('opens the first panel and folds the others', async () => {
    await render(ServicePanels);

    expect(screen.getByRole('button', { name: 'Site surveys', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Aerial mapping', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('points each trigger at the description it reveals', async () => {
    const { fixture } = await render(ServicePanels);
    const trigger = screen.getByRole('button', { name: 'Field photography', hidden: true });
    const controls = trigger.getAttribute('aria-controls')!;

    const region = (fixture.nativeElement as HTMLElement).querySelector(`#${controls}`);
    expect(region?.textContent).toContain('captioned record');
  });

  it('widens the chosen panel by rewriting the grid columns', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ServicePanels);
    const host = fixture.nativeElement as HTMLElement;
    const panels = host.querySelector<HTMLElement>('.panels')!;

    expect(panels.style.getPropertyValue('--columns')).toBe(
      'minmax(0, 2.65fr) minmax(0, 1fr) minmax(0, 1fr)'
    );

    await user.click(screen.getByRole('button', { name: 'Aerial mapping', hidden: true }));

    expect(screen.getByRole('button', { name: 'Aerial mapping', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Site surveys', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(panels.style.getPropertyValue('--columns')).toBe(
      'minmax(0, 1fr) minmax(0, 2.65fr) minmax(0, 1fr)'
    );
    expect(host.querySelectorAll('[data-expanded="true"]')).toHaveLength(1);
  });

  it('keeps every panel link reachable', async () => {
    await render(ServicePanels);

    expect(screen.getByRole('link', { name: /Explore site surveys/ })).toHaveAttribute(
      'href',
      '#surveys'
    );
  });
});
