import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SectionNav } from './section-nav';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

const observers: {
  callback: Callback;
  options: IntersectionObserverInit;
  observed: Element[];
  disconnected: boolean;
}[] = [];

class FakeObserver {
  private readonly record: (typeof observers)[number];
  constructor(callback: Callback, options: IntersectionObserverInit = {}) {
    this.record = { callback, options, observed: [], disconnected: false };
    observers.push(this.record);
  }
  observe(element: Element) {
    this.record.observed.push(element);
  }
  disconnect() {
    this.record.disconnected = true;
  }
  unobserve() {}
}

const sections = [
  { id: 'one', label: 'One', paragraphs: ['a'] },
  { id: 'two', label: 'Two', paragraphs: ['b'] },
  { id: 'three', label: 'Three', paragraphs: ['c'] },
];

const current = () =>
  screen
    .getAllByRole('link')
    .filter(link => link.getAttribute('aria-current') === 'location')
    .map(link => link.textContent?.trim());

const live = () => observers.filter(o => !o.disconnected);

describe('SectionNav', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    window.location.hash = '';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('links to native fragments and starts on the first section', async () => {
    await render(SectionNav, { inputs: { sections } });

    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('href', '#two');
    expect(current()).toEqual(['One']);
    expect(document.getElementById('two')).not.toBeNull();
  });

  it('follows the section that reaches the reading band, in document order', async () => {
    const { fixture } = await render(SectionNav, { inputs: { sections } });
    await fixture.whenStable();
    const [observer] = live();
    const target = (id: string) => document.getElementById(id)!;

    observer.callback([{ target: target('two'), isIntersecting: true }]);
    await fixture.whenStable();
    expect(current()).toEqual(['Two']);

    // Two sections in the band: the earlier one wins.
    observer.callback([{ target: target('three'), isIntersecting: true }]);
    await fixture.whenStable();
    expect(current()).toEqual(['Two']);

    // Leaving the band entirely keeps the last active section rather than clearing it.
    observer.callback([
      { target: target('two'), isIntersecting: false },
      { target: target('three'), isIntersecting: false },
    ]);
    await fixture.whenStable();
    expect(current()).toEqual(['Two']);
  });

  it('observes every section with a band that starts below the sticky offset', async () => {
    const { fixture } = await render(SectionNav, { inputs: { sections, offset: 64 } });
    await fixture.whenStable();
    const [observer] = live();

    expect(observer.observed.map(el => el.id)).toEqual(['one', 'two', 'three']);
    expect(observer.options.rootMargin).toBe('-64px 0px -60% 0px');
    expect(document.getElementById('two')!.style.scrollMarginTop).toBe('64px');
  });

  it('marks a clicked link active even if its section can never reach the band', async () => {
    const user = userEvent.setup();
    await render(SectionNav, { inputs: { sections } });
    const three = screen.getByRole('link', { name: 'Three' });
    three.addEventListener('click', event => event.preventDefault());

    await user.click(three);

    expect(current()).toEqual(['Three']);
  });

  it('honours a hash on load and a later hashchange', async () => {
    window.location.hash = '#two';
    const { fixture } = await render(SectionNav, { inputs: { sections } });
    await fixture.whenStable();
    expect(current()).toEqual(['Two']);

    window.location.hash = '#three';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await fixture.whenStable();
    expect(current()).toEqual(['Three']);

    window.location.hash = '#nope';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await fixture.whenStable();
    expect(current()).toEqual(['Three']);
  });

  it('moves focus between links with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    await render(SectionNav, { inputs: { sections } });

    screen.getByRole('link', { name: 'One' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'Two' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('link', { name: 'Three' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{Home}');
    expect(screen.getByRole('link', { name: 'One' })).toHaveFocus();
  });

  it('rebuilds the observer for new sections and disconnects the old one', async () => {
    const { fixture, rerender } = await render(SectionNav, { inputs: { sections } });
    await fixture.whenStable();
    expect(live()).toHaveLength(1);

    await rerender({
      inputs: { sections: [...sections, { id: 'four', label: 'Four', paragraphs: ['d'] }] },
    });
    await fixture.whenStable();

    expect(observers[0].disconnected).toBe(true);
    expect(live()).toHaveLength(1);
    expect(live()[0].observed.map(el => el.id)).toContain('four');
  });

  it('disconnects its observer and listeners when destroyed', async () => {
    const { fixture } = await render(SectionNav, { inputs: { sections } });
    await fixture.whenStable();
    const remove = vi.spyOn(window, 'removeEventListener');

    fixture.destroy();

    expect(live()).toHaveLength(0);
    expect(remove).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });

  it('only smooth-scrolls for visitors who have not asked for reduced motion', async () => {
    const { fixture } = await render(SectionNav, { inputs: { sections } });
    const scroller = (fixture.nativeElement as HTMLElement).querySelector(
      'section'
    )!.parentElement!;

    expect(scroller.className).toContain('motion-safe:scroll-smooth');
    expect(scroller.className).not.toMatch(/(^|\s)scroll-smooth/);
  });

  it('works where IntersectionObserver does not exist', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    await render(SectionNav, { inputs: { sections } });

    expect(current()).toEqual(['One']);
  });
});
