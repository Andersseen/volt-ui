import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { FEATURED_COMPONENTS } from './featured';
import { LandingShowcase } from './landing-showcase';

describe('landing component carousel', () => {
  it('renders a card for every featured component, each linking to its page', async () => {
    await render(LandingShowcase, { providers: [provideRouter([])] });

    expect(screen.getAllByRole('listitem')).toHaveLength(FEATURED_COMPONENTS.length);
    expect(screen.getAllByRole('link', { name: /Learn more/ }).length).toBe(
      FEATURED_COMPONENTS.length
    );
  });

  it('names its icon-only controls', async () => {
    await render(LandingShowcase, { providers: [provideRouter([])] });

    expect(screen.getByRole('button', { name: 'Previous components' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next components' })).toBeInTheDocument();
  });

  it('steps one card forward or back', async () => {
    const { fixture } = await render(LandingShowcase, { providers: [provideRouter([])] });
    const track = fixture.nativeElement.querySelector('ul') as HTMLElement;
    track.scrollBy = vi.fn();

    fixture.componentInstance.step(1);
    fixture.componentInstance.step(-1);

    expect(track.scrollBy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ behavior: 'smooth' })
    );
    const [[forward], [back]] = (track.scrollBy as ReturnType<typeof vi.fn>).mock.calls;
    expect(forward.left).toBeGreaterThan(0);
    expect(back.left).toBeLessThan(0);
  });
});
