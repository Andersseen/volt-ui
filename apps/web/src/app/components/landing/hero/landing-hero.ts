import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltThreads } from '../../effects/volt-threads';
import { HeroCopy } from './hero-copy';
import { HeroSource } from './hero-source';

/**
 * The landing hero: threads of current behind the value proposition, and a card that shows the
 * source you would own next to the real component it renders. The threads converge between the two columns, react to the pointer and burst on
 * click; the copy and panel enter with a CSS animation that starts at first paint.
 */
@Component({
  selector: 'app-landing-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltThreads, HeroCopy, HeroSource],
  template: `
    <section class="hero relative isolate overflow-hidden border-b border-border/60">
      <div class="hero-grid pointer-events-none absolute inset-0 -z-10"></div>
      <app-volt-threads class="hero-threads -z-10" [pinchX]="0.53" [pinchY]="0.57" />
      <div class="hero-fade pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40"></div>

      <div
        class="relative mx-auto grid min-h-[min(88vh,56rem)] max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24"
      >
        <app-hero-copy />
        <app-hero-source class="reveal-up reveal-delay-3" />
      </div>
    </section>
  `,
  styles: `
    .hero {
      background: var(--background);
    }

    .hero-grid {
      background-image:
        linear-gradient(
          to right,
          color-mix(in oklch, var(--border) 45%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklch, var(--border) 45%, transparent) 1px,
          transparent 1px
        );
      background-size: 44px 44px;
      mask-image: radial-gradient(ellipse 70% 60% at 55% 45%, black 20%, transparent 75%);
    }

    /* The threads fade out toward the edges and behind the headline, so the copy stays legible. */
    .hero-threads {
      mask-image: radial-gradient(ellipse 48% 62% at 53% 57%, black 30%, transparent 78%);
    }

    .hero-fade {
      background: linear-gradient(to bottom, transparent, var(--background));
    }
  `,
})
export class LandingHero {}
