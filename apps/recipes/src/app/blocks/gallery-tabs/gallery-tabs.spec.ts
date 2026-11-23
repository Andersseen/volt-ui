import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GalleryTabs } from './gallery-tabs';

const reducedMotion = (matches: boolean) =>
  vi
    .spyOn(window, 'matchMedia')
    .mockReturnValue({ matches, addEventListener() {}, removeEventListener() {} } as never);

/** An observer that reports the gallery on screen straight away. */
const onScreen = () =>
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private readonly callback: IntersectionObserverCallback) {}
      observe() {
        this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
      }
      disconnect() {}
      unobserve() {}
    }
  );

const segmentRun = (host: HTMLElement) => host.querySelector('.segment-run');

describe('GalleryTabs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows a tab per category and the first photo of the first one', async () => {
    reducedMotion(true);
    await render(GalleryTabs);

    expect(screen.getAllByRole('tab').map(tab => tab.textContent?.trim())).toEqual([
      'Landscapes',
      'Water',
      'Forests',
    ]);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('granite wall');
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('data-selected');
  });

  it('features the thumbnail you pick, and marks it chosen', async () => {
    reducedMotion(true);
    const user = userEvent.setup();
    const { fixture } = await render(GalleryTabs);

    await user.click(screen.getByRole('radio', { name: /desert road/ }));
    await fixture.whenStable();

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('desert road');
    // The full-colour rule hangs off data-chosen, so it must follow the selection.
    const chosen = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-chosen]');
    expect(chosen).toHaveLength(1);
    expect(chosen[0].querySelector('[role="radio"]')).toHaveAttribute(
      'aria-label',
      'A desert road running toward red mountains'
    );
    expect(screen.getByRole('button', { name: /Open photo: A desert road/ })).toBeInTheDocument();
  });

  it('switches category from the tabs', async () => {
    reducedMotion(true);
    const user = userEvent.setup();
    await render(GalleryTabs);

    await user.click(screen.getByRole('tab', { name: 'Water' }));

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('waterfall');
  });

  it('walks through every photo and on to the next tab when each segment fills', async () => {
    reducedMotion(false);
    onScreen();
    const { fixture } = await render(GalleryTabs);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    for (let step = 0; step < 4; step++) {
      segmentRun(host)!.dispatchEvent(new Event('animationend'));
      await fixture.whenStable();
    }

    expect(screen.getByRole('tab', { name: 'Water' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('waterfall');
  });

  it('waits while the pointer is on the gallery and stops for good from the button', async () => {
    reducedMotion(false);
    onScreen();
    const user = userEvent.setup();
    const { fixture } = await render(GalleryTabs);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    host.querySelector('section')!.dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(segmentRun(host)).toHaveClass('paused');

    await user.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    expect(segmentRun(host)).toBeNull();
    expect(host.querySelector('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });

  it('holds still while off screen', async () => {
    reducedMotion(false);
    const { fixture } = await render(GalleryTabs);
    await fixture.whenStable();

    // The default observer never reports the gallery visible.
    expect(segmentRun(fixture.nativeElement as HTMLElement)).toHaveClass('paused');
  });

  it('never starts autoplay under reduced motion', async () => {
    reducedMotion(true);
    const { fixture } = await render(GalleryTabs);
    await fixture.whenStable();

    expect(segmentRun(fixture.nativeElement as HTMLElement)).toBeNull();
  });

  it('opens the featured photo full size in a dialog', async () => {
    reducedMotion(true);
    const user = userEvent.setup();
    await render(GalleryTabs);

    await user.click(screen.getByRole('button', { name: /Open photo/ }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('A granite wall above a pine meadow');
  });
});
