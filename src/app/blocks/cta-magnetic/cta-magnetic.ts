import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { LmnArrowRightIcon, LmnCheckIcon } from 'lumen-icons';
import { VoltButton, VoltInput } from 'volt';

/** How far from the button the pull starts, in pixels. */
const FIELD_RADIUS = 140;
/** Fraction of the pointer's offset the button travels. Above ~0.4 it feels unhinged. */
const PULL = 0.28;

/**
 * Sub-pixel precision is invisible and float multiplication is not exact, so without this
 * the element carries values like `-14.000000000000002px` and the style string changes on
 * frames where nothing actually moved.
 */
const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Closing call to action with a button that leans toward the pointer.
 *
 * The pull is applied to a wrapper, not to `volt-button` itself: Volt's custom elements
 * declare no `display`, and `translate` has no effect on an inline box, so the button
 * would simply refuse to move. The wrapper is `inline-flex`, which gives the transform
 * something to act on.
 *
 * The panel's border is a conic gradient on a rotating pseudo-element rather than an
 * animated `@property` angle — a registered custom property is global, and a copied block
 * should not quietly install one in the host application.
 */
@Component({
  selector: 'app-cta-magnetic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltButton, VoltInput, LmnArrowRightIcon, LmnCheckIcon],
  template: `
    <section class="bg-background px-4 py-20 sm:px-6 sm:py-24">
      <div
        class="cta-panel relative mx-auto max-w-4xl overflow-hidden rounded-2xl px-6 py-16 text-center sm:px-12"
        (pointermove)="pull($event)"
        (pointerleave)="release()"
      >
        <span class="cta-border" aria-hidden="true"></span>
        <span class="cta-glow" aria-hidden="true"></span>

        <div class="relative mx-auto max-w-2xl">
          <h2 class="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Start from a block. Ship the page today.
          </h2>
          <p class="mt-4 text-balance text-lg text-muted-foreground">
            Get one new section every week, plus the source for everything already here.
          </p>

          <form
            class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            (submit)="submit($event)"
          >
            <!-- Bound rather than static, so the id lands on the inner <input> only;
                 a static attribute is also rendered on the host, and the label's for
                 would then point at a custom element that cannot be labelled. -->
            <label class="sr-only" for="cta-email">Email address</label>
            <volt-input
              [id]="'cta-email'"
              type="email"
              class="w-full sm:w-72"
              placeholder="you@company.com"
            />

            <!-- The magnet, not the button, is what actually moves. -->
            <span #magnet class="magnet inline-flex w-full sm:w-auto">
              <volt-button type="submit" size="lg" class="group w-full sm:w-auto">
                Get the blocks
                <lmn-arrow-right
                  slot="trailing"
                  [size]="16"
                  class="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                />
              </volt-button>
            </span>
          </form>

          <ul
            class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            @for (point of points; track point) {
              <li class="flex items-center gap-1.5">
                <lmn-check [size]="14" class="text-success" />
                {{ point }}
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    .cta-panel {
      background: color-mix(in oklch, var(--primary) 6%, var(--surface));
    }

    /* A conic gradient twice the panel's diagonal, spun slowly and clipped to a 1px band.
       Rotating an oversized square avoids registering a custom property just to animate
       an angle. */
    .cta-border {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      overflow: hidden;
      pointer-events: none;
      mask:
        linear-gradient(black, black) content-box,
        linear-gradient(black, black);
      mask-composite: exclude;
      -webkit-mask:
        linear-gradient(black, black) content-box,
        linear-gradient(black, black);
      -webkit-mask-composite: xor;
      background: color-mix(in oklch, var(--border) 90%, transparent);
    }

    .cta-border::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 220%;
      aspect-ratio: 1;
      translate: -50% -50%;
      background: conic-gradient(
        from 0deg,
        transparent 0deg,
        color-mix(in oklch, var(--primary) 90%, transparent) 60deg,
        transparent 140deg,
        transparent 220deg,
        color-mix(in oklch, var(--info) 80%, transparent) 280deg,
        transparent 340deg
      );
      animation: spin 9s linear infinite;
    }

    .cta-glow {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background: radial-gradient(
        60% 60% at 50% 0%,
        color-mix(in oklch, var(--primary) 14%, transparent),
        transparent 70%
      );
    }

    .magnet {
      transition: translate 420ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* While the pointer is inside the field the position is driven frame by frame, so the
       easing above would fight it — it exists for the snap back on pointerleave. */
    .magnet.is-pulled {
      transition: none;
    }

    @keyframes spin {
      to {
        rotate: 360deg;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cta-border::before {
        animation: none;
      }

      .magnet,
      .magnet.is-pulled {
        transition: none;
        translate: none;
      }
    }
  `,
})
export class CtaMagnetic {
  private readonly magnet = viewChild.required<ElementRef<HTMLElement>>('magnet');

  protected readonly points = ['No credit card', 'MIT licensed', 'Unsubscribe anytime'];

  /** Leans the button toward the pointer while it is inside the field, then lets go. */
  protected pull(event: PointerEvent): void {
    const element = this.magnet().nativeElement;

    // Respecting the preference here as well as in CSS: the transition is what the media
    // query can switch off, but the position itself is set from script.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const box = element.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);

    if (Math.hypot(dx, dy) > FIELD_RADIUS) {
      this.release();
      return;
    }

    element.classList.add('is-pulled');
    element.style.translate = `${round(dx * PULL)}px ${round(dy * PULL)}px`;
  }

  protected release(): void {
    const element = this.magnet().nativeElement;

    element.classList.remove('is-pulled');
    element.style.translate = '';
  }

  protected submit(event: Event): void {
    // The block is a layout, not a signup flow — wire this to your own handler.
    event.preventDefault();
  }
}
