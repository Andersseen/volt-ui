import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * Reveals the host as it scrolls into view.
 *
 * Progressive enhancement on purpose: the server renders the element in its final,
 * visible state, and the hidden start state is only ever applied from the browser.
 * A visitor without JS — or a crawler — sees the full page rather than a blank one.
 *
 * Elements already inside the viewport on load are left alone entirely, so arming
 * them can never cause a flash of hidden content during hydration.
 */
@Directive({
  selector: '[appReveal]',
})
export class Reveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Stagger, in milliseconds, applied before this element animates. */
  readonly appReveal = input(0, { transform: numberAttribute });

  constructor() {
    // afterNextRender never runs on the server, so this is the browser-only branch.
    afterNextRender(() => this.arm());
  }

  private arm(): void {
    const element = this.host.nativeElement;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const box = element.getBoundingClientRect();
    const alreadyVisible = box.top < window.innerHeight && box.bottom > 0;
    if (alreadyVisible) {
      return;
    }

    element.style.setProperty('--reveal-delay', `${this.appReveal()}ms`);
    element.classList.add('reveal-armed');

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          // A fast scroll or a jump to an anchor can carry an element past the
          // viewport between two callbacks, so it is reported as not intersecting
          // even though the visitor scrolled through it. Revealing anything already
          // above the fold as well means content can never stay stuck at opacity 0.
          const scrolledPast = entry.boundingClientRect.bottom <= 0;
          if (!entry.isIntersecting && !scrolledPast) {
            continue;
          }
          element.classList.add('reveal-visible');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(element);
  }
}
