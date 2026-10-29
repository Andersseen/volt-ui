import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppDashboard } from '../blocks/app-dashboard/app-dashboard';
import { AuthLogin } from '../blocks/auth-login/auth-login';
import { ContactSplit } from '../blocks/contact-split/contact-split';
import { CtaMagnetic } from '../blocks/cta-magnetic/cta-magnetic';
import { FeatureBento } from '../blocks/feature-bento/feature-bento';
import { FooterSitemap } from '../blocks/footer-sitemap/footer-sitemap';
import { HeroSplit } from '../blocks/hero-split/hero-split';
import { HeroSpotlight } from '../blocks/hero-spotlight/hero-spotlight';
import { PricingTiers } from '../blocks/pricing-tiers/pricing-tiers';
import { ServiceList } from '../blocks/service-list/service-list';
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
  imports: [
    HeroSpotlight,
    HeroSplit,
    FeatureBento,
    ServiceList,
    PricingTiers,
    TestimonialMarquee,
    ContactSplit,
    AuthLogin,
    AppDashboard,
    CtaMagnetic,
    FooterSitemap,
  ],
  host: {
    inert: '',
    'aria-hidden': 'true',
    // `contain: inline-size` keeps the 1180px stage from becoming the host's min-content width, which in a
    // one-column grid stretched the card to 1180px and left the scale at 1.
    class:
      'pointer-events-none block h-full w-full select-none overflow-hidden [contain:inline-size]',
  },
  template: `
    <div class="stage" [style.scale]="scale()">
      @switch (slug()) {
        @case ('hero') {
          <app-hero-spotlight />
        }
        @case ('hero-split') {
          <app-hero-split />
        }
        @case ('bento') {
          <app-feature-bento />
        }
        @case ('services') {
          <app-service-list />
        }
        @case ('pricing') {
          <app-pricing-tiers />
        }
        @case ('testimonials') {
          <app-testimonial-marquee />
        }
        @case ('contact') {
          <app-contact-split />
        }
        @case ('cta') {
          <app-cta-magnetic />
        }
        @case ('login') {
          <app-auth-login />
        }
        @case ('dashboard') {
          <app-app-dashboard />
        }
        @case ('footer') {
          <app-footer-sitemap />
        }
      }
    </div>
  `,
  styles: `
    /* Laid out at a desktop width and shrunk, so the thumbnail shows the block's real
       proportions instead of its mobile stack. The scale follows the frame's width. */
    .stage {
      width: 1180px;
      transform-origin: top left;
    }
  `,
})
export class BlockThumbnail {
  readonly slug = input.required<string>();

  /** The width the block is laid out at before it is scaled to the frame. */
  private static readonly STAGE_WIDTH = 1180;

  /** Fits a ~350px card until the browser measures the real frame (and on the server). */
  protected readonly scale = signal(0.3);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    // Analog's dev server runs after-render hooks during SSR too, where there is no ResizeObserver.
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    afterNextRender(() => {
      if (!isBrowser) return;
      const fit = () => {
        const width = host.clientWidth;
        if (width > 0) this.scale.set(width / BlockThumbnail.STAGE_WIDTH);
      };
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
