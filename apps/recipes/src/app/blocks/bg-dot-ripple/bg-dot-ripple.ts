import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnArrowRightIcon } from 'lumen-icons';
import { VoltBadge, VoltButton } from 'volt';

/**
 * A quiet dotted surface with rings of light that travel out from the middle, like a drop in water.
 *
 * Everything is CSS. The dots are one `radial-gradient` background tile; each ring is a second copy
 * of the same tile in the primary colour, masked by a thin ring whose `mask-size` grows. Animating
 * `mask-size` needs no registered custom property — a copied block should not install a global
 * `@property` in the host application — and no JavaScript, so it renders on the server, costs
 * nothing while off screen (the browser skips painting it) and is simply still under reduced
 * motion, where the rings are not drawn at all.
 *
 * The dots fade towards the edges through a radial mask, so the section blends into whatever sits
 * above and below it without a hard border.
 */
@Component({
  selector: 'app-bg-dot-ripple',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltButton, LmnArrowRightIcon],
  template: `
    <section
      class="@container relative isolate overflow-hidden bg-background px-4 py-28 @3xl:py-36"
    >
      <div class="field" aria-hidden="true">
        <span class="dots"></span>
        <span class="ring"></span>
        <span class="ring late"></span>
      </div>

      <div class="relative mx-auto max-w-xl text-center">
        <volt-badge variant="secondary">Realtime sync</volt-badge>
        <h2 class="mt-5 text-balance text-4xl font-bold tracking-tight @2xl:text-5xl">
          One change, everywhere at once
        </h2>
        <p class="mt-4 text-balance text-lg text-muted-foreground">
          Edits travel to every open tab and device in under fifty milliseconds — and settle the
          same way on all of them.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <volt-button size="lg" class="group">
            See it live
            <lmn-arrow-right
              slot="trailing"
              [size]="16"
              class="transition-transform motion-safe:group-hover:translate-x-0.5"
            />
          </volt-button>
          <volt-button size="lg" variant="outline">Read the protocol</volt-button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .field {
      position: absolute;
      inset: 0;
      z-index: -1;
      mask: radial-gradient(ellipse 70% 65% at 50% 50%, black 30%, transparent 75%);
    }

    .dots,
    .ring {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, var(--dot) 1.2px, transparent 1.6px);
      background-size: 22px 22px;
      background-position: center;
    }

    .dots {
      --dot: color-mix(in oklch, var(--muted-foreground) 45%, transparent);
    }

    .ring {
      --dot: var(--primary);
      opacity: 0;
      mask-image: radial-gradient(circle, transparent 44%, black 48%, black 50%, transparent 54%);
      mask-position: center;
      mask-repeat: no-repeat;
      mask-size: 0 0;
    }

    @media (prefers-reduced-motion: no-preference) {
      .ring {
        animation: ripple 6s cubic-bezier(0.25, 0.6, 0.3, 1) infinite;
      }
      .ring.late {
        animation-delay: 3s;
      }
    }

    @keyframes ripple {
      0% {
        mask-size: 0 0;
        opacity: 0.9;
      }
      80% {
        opacity: 0.35;
      }
      100% {
        mask-size: 260% 260%;
        opacity: 0;
      }
    }
  `,
})
export class BgDotRipple {}
