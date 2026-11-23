import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroRail } from './hero-rail';

const reducedMotion = (matches: boolean) =>
  vi
    .spyOn(window, 'matchMedia')
    .mockReturnValue({ matches, addEventListener() {}, removeEventListener() {} } as never);

describe('HeroRail', () => {
  afterEach(() => vi.restoreAllMocks());

  it('offers one photo at a time from a single-choice strip', async () => {
    reducedMotion(true);
    await render(HeroRail);

    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveAttribute('data-selected');
    expect(screen.getByRole('radiogroup', { name: 'Choose a photo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows the photo picked from the strip, with its counter and caption', async () => {
    reducedMotion(true);
    const user = userEvent.setup();
    const { fixture } = await render(HeroRail);
    const host = fixture.nativeElement as HTMLElement;

    await user.click(screen.getByRole('radio', { name: /turquoise alpine lake/ }));
    await fixture.whenStable();

    expect(screen.getByRole('radio', { name: /turquoise alpine lake/ })).toHaveAttribute(
      'data-selected'
    );
    expect(host.textContent).toContain('02');
    expect(screen.getByRole('img', { name: /turquoise alpine lake/ })).toBeInTheDocument();
  });

  it('advances when the progress bar in the active thumbnail fills', async () => {
    reducedMotion(false);
    const { fixture } = await render(HeroRail);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    const bar = host.querySelector('.progress');
    expect(bar).not.toBeNull();
    bar!.dispatchEvent(new Event('animationend', { bubbles: true }));
    await fixture.whenStable();

    expect(screen.getAllByRole('radio')[1]).toHaveAttribute('data-selected');
  });

  it('pauses the bar while the pointer is on the carousel, and stops for good from the button', async () => {
    reducedMotion(false);
    const user = userEvent.setup();
    const { fixture } = await render(HeroRail);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const carousel = host.querySelector('[aria-roledescription="carousel"]')!;

    carousel.dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(host.querySelector('.progress')).toHaveClass('paused');

    await user.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    expect(host.querySelector('.progress')).toBeNull();
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeInTheDocument();
    // Announced only once the visitor is in control.
    expect(host.querySelector('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });

  it('never starts autoplay under reduced motion', async () => {
    reducedMotion(true);
    const { fixture } = await render(HeroRail);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('.progress')).toBeNull();
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeInTheDocument();
  });
});
