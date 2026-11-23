import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FooterCurtain } from './footer-curtain';

/** A 2D context that records how often it was asked to paint. */
const fakeContext = () => {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
  return context;
};

describe('FooterCurtain', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is a footer that stays stuck to the bottom, behind the page above it', async () => {
    fakeContext();
    const { fixture } = await render(FooterCurtain);
    const host = fixture.nativeElement as HTMLElement;
    const footer = screen.getByRole('contentinfo');

    expect(footer).toHaveClass('sticky', 'bottom-0');
    // Never taller than the screen, or its own top would stay hidden for good.
    expect(footer).toHaveClass('min-h-svh');
    expect(host.firstElementChild).toHaveClass('relative', 'z-10', 'bg-background');
  });

  it('names its link groups and each icon-only social link', async () => {
    fakeContext();
    await render(FooterCurtain);

    expect(screen.getByRole('navigation', { name: 'Explore' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Services' })).toBeInTheDocument();
    for (const label of ['GitHub', 'Photo journal', 'Chat with us']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('starts watching its visibility once it can draw', async () => {
    fakeContext();
    const observe = vi.spyOn(window.IntersectionObserver.prototype, 'observe');

    await render(FooterCurtain);

    expect(observe).toHaveBeenCalledTimes(1);
  });

  it('keeps the dotted glow out of the accessibility tree', async () => {
    fakeContext();
    const { fixture } = await render(FooterCurtain);
    const glow = (fixture.nativeElement as HTMLElement).querySelector('canvas')!.parentElement!;

    expect(glow).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws nothing and throws nothing without a 2D context', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    // Angular schedules its own frames, so watch the glow's observers instead.
    const observe = vi.spyOn(window.IntersectionObserver.prototype, 'observe');

    await render(FooterCurtain);

    expect(observe).not.toHaveBeenCalled();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
