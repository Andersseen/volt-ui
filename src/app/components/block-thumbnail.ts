import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CtaMagnetic } from '../blocks/cta-magnetic/cta-magnetic';
import { FeatureBento } from '../blocks/feature-bento/feature-bento';
import { HeroSpotlight } from '../blocks/hero-spotlight/hero-spotlight';
import { PricingTiers } from '../blocks/pricing-tiers/pricing-tiers';
import { TestimonialMarquee } from '../blocks/testimonial-marquee/testimonial-marquee';

/**
 * A real block, rendered at desktop width and scaled down to thumbnail size.
 *
 * A hand-drawn mock would have been cheaper and would have started lying the first time
 * a block changed. Scaling the actual component means the card cannot misrepresent what
 * the page behind it contains.
 *
 * The host is `inert`, which is what makes a card a single link: the blocks contain real
 * buttons and inputs, and without it a visitor tabbing through the gallery would land on
 * every one of them inside a thumbnail they cannot even see properly. `inert` takes the
 * subtree out of the tab order, out of the accessibility tree and out of hit testing in
 * one attribute — `pointer-events-none` alone only covers the last of the three.
 */
@Component({
  selector: 'app-block-thumbnail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroSpotlight, FeatureBento, PricingTiers, TestimonialMarquee, CtaMagnetic],
  host: {
    inert: '',
    'aria-hidden': 'true',
    class: 'pointer-events-none block h-full w-full select-none',
  },
  template: `
    <div class="stage">
      @switch (slug()) {
        @case ('hero') {
          <app-hero-spotlight />
        }
        @case ('bento') {
          <app-feature-bento />
        }
        @case ('pricing') {
          <app-pricing-tiers />
        }
        @case ('testimonials') {
          <app-testimonial-marquee />
        }
        @case ('cta') {
          <app-cta-magnetic />
        }
      }
    </div>
  `,
  styles: `
    /* Laid out at a desktop width and shrunk, so the thumbnail shows the block's real
       proportions instead of its mobile stack. */
    .stage {
      width: 1180px;
      transform-origin: top left;
      scale: 0.3;
    }
  `,
})
export class BlockThumbnail {
  readonly slug = input.required<string>();
}
