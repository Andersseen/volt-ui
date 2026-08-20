import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { MOVE_PRESETS, MoveAnimator, type MovePreset } from 'angular-movement';
import { MOTION } from '../lib/motion';

/**
 * Reveals the host as it scrolls into view, using angular-movement to play the animation
 * so easing, duration and the reduced-motion policy match the rest of the site.
 *
 * Progressive enhancement on purpose: the server renders the element in its final,
 * visible state, and the hidden start state is only ever applied from the browser.
 * A visitor without JS — or a crawler — sees the full page rather than a blank one.
 *
 * Elements already inside the viewport on load are left alone entirely. This is the
 * reason the directive exists instead of a bare `moveInView`: that one hides whatever it
 * is put on as soon as it initialises, and on a server-rendered page that means content
 * the visitor is already reading blinks out and fades back during hydration.
 */
@Directive({
  selector: '[appReveal]',
})
export class Reveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly animator = inject(MoveAnimator);

  /** Stagger, in milliseconds, applied before this element animates. */
  readonly appReveal = input(0, { transform: numberAttribute });

  /** Which angular-movement preset to play. */
  readonly appRevealPreset = input<MovePreset>('fade-up');

  private observer: IntersectionObserver | null = null;

  constructor() {
    // afterNextRender never runs on the server, so this is the browser-only branch.
    afterNextRender(() => this.arm());
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
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

    // Safe to hide: the element is off screen, so nothing the visitor can see changes.
    element.style.opacity = '0';

    this.observer = new IntersectionObserver(
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
          this.play();
          this.observer?.disconnect();
          this.observer = null;
        }
      },
      { rootMargin: MOTION.viewMargin }
    );

    this.observer.observe(element);
  }

  private play(): void {
    const element = this.host.nativeElement;
    // The inline opacity would otherwise win over the animation's own opacity track.
    element.style.removeProperty('opacity');
    this.animator.animate(element, MOVE_PRESETS[this.appRevealPreset()].enter, {
      duration: MOTION.revealDuration,
      delay: this.appReveal(),
    });
  }
}
