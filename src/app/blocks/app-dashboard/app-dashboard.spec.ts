import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDashboard } from './app-dashboard';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

/*
 * jsdom never paints, so its animation frames never arrive on their own. Driving them
 * from the test is better than waiting for real ones anyway: the count becomes
 * deterministic, and the assertion is about where the figure lands rather than about how
 * long the machine took to get there.
 */

describe('AppDashboard', () => {
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  let reveal: ObserverCallback;
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
        constructor(callback: ObserverCallback) {
          reveal = callback;
        }
      }
    );
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);

    frames = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      frames.push(callback)
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    // The component reads this once to mark the start; keeping it at zero makes the
    // timestamps handed to each frame absolute.
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const renderDashboard = () => render(AppDashboard, { providers: [provideRouter([])] });

  /** Runs whatever frames are pending, at the timestamp the test chooses. */
  const runFrame = async (timestamp: number) => {
    const pending = frames;
    frames = [];
    for (const callback of pending) {
      callback(timestamp);
    }
  };

  it('waits for the figures to be scrolled into view before counting', async () => {
    await renderDashboard();

    expect(observe).toHaveBeenCalledOnce();
    // Nothing has been revealed, so every figure still reads zero.
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('counts each figure to its value once revealed', async () => {
    const { fixture } = await renderDashboard();

    reveal([{ isIntersecting: true }]);

    // Halfway through the count the figures are on their way, not at zero and not there.
    await runFrame(400);
    await fixture.whenStable();
    expect(screen.queryByText('$45,231')).not.toBeInTheDocument();
    expect(screen.queryByText('$0')).not.toBeInTheDocument();

    // Past the duration they land exactly on their target, not near it.
    await runFrame(1200);
    await fixture.whenStable();
    expect(screen.getByText('$45,231')).toBeInTheDocument();
    expect(screen.getByText('2,350')).toBeInTheDocument();
    expect(screen.getByText('3.24%')).toBeInTheDocument();
  });

  it('counts once and never again, because a re-counting figure cannot be read', async () => {
    await renderDashboard();

    reveal([{ isIntersecting: true }]);

    expect(disconnect).toHaveBeenCalled();
  });

  it('ignores the observer until the row is actually intersecting', async () => {
    await renderDashboard();

    reveal([{ isIntersecting: false }]);

    expect(disconnect).not.toHaveBeenCalled();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('starts finished under reduced motion, without observing anything', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);

    await renderDashboard();

    expect(observe).not.toHaveBeenCalled();
    expect(screen.getByText('$45,231')).toBeInTheDocument();
  });

  it('draws the chart from the series rather than leaving a placeholder', async () => {
    const { fixture } = await renderDashboard();
    const host = fixture.nativeElement as HTMLElement;

    const line = host.querySelector('.chart-line')!.getAttribute('d')!;
    const area = host.querySelector('.chart-area')!.getAttribute('d')!;

    // A pure mapping of the data, so the server and the browser draw the same path and
    // hydration has nothing to disagree about.
    expect(line.startsWith('M')).toBe(true);
    expect(line.split('L')).toHaveLength(12);
    expect(area.endsWith('Z')).toBe(true);
  });
});
