import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroSplit } from './hero-split';

const reducedMotion = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches } as MediaQueryList);

describe('HeroSplit', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('advances the deploy panel on its own', async () => {
    reducedMotion(false);
    // Only the interval is faked. Faking setTimeout too would hang render(), which awaits
    // the zoneless scheduler, and the test would time out before asserting anything.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const { fixture } = await render(HeroSplit);

    const progress = () =>
      (fixture.nativeElement as HTMLElement).querySelector('volt-progress')!.textContent!;

    expect(progress()).toContain('0%');

    vi.advanceTimersByTime(2200);
    await fixture.whenStable();
    expect(progress()).toContain('25%');

    vi.advanceTimersByTime(2200 * 3);
    await fixture.whenStable();
    expect(progress()).toContain('100%');
  });

  it('starts finished, and never starts a timer, when reduced motion is asked for', async () => {
    reducedMotion(true);
    const interval = vi.spyOn(window, 'setInterval');
    const { fixture } = await render(HeroSplit);

    expect(interval).not.toHaveBeenCalled();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('volt-progress')!.textContent
    ).toContain('100%');
  });

  it('stops the timer when the block is destroyed', async () => {
    reducedMotion(false);
    const clear = vi.spyOn(window, 'clearInterval');
    const { fixture } = await render(HeroSplit);

    fixture.destroy();

    expect(clear).toHaveBeenCalled();
  });

  it('straightens the panel while the pointer is over the section', async () => {
    reducedMotion(false);
    const { fixture } = await render(HeroSplit);
    const host = fixture.nativeElement as HTMLElement;
    const stage = host.querySelector('.panel-stage')!;

    host.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
    expect(stage.classList.contains('is-near')).toBe(true);

    host.dispatchEvent(new MouseEvent('pointerleave', { bubbles: true }));
    expect(stage.classList.contains('is-near')).toBe(false);
  });

  it('announces the deploy steps as they change', async () => {
    reducedMotion(true);
    await render(HeroSplit);

    // aria-live, or four list items would swap icons in silence.
    expect(screen.getByRole('list')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
