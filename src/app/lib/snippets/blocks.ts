/**
 * Block sources, read straight off disk by Vite's `?raw` import.
 *
 * The point of going through the real file rather than a hand-written template literal:
 * the code on the page is the code running above it, so the two cannot drift. Editing a
 * block updates its documentation in the same commit, for free.
 */
import ctaMagneticSource from '../../blocks/cta-magnetic/cta-magnetic.ts?raw';
import featureBentoSource from '../../blocks/feature-bento/feature-bento.ts?raw';
import heroSpotlightSource from '../../blocks/hero-spotlight/hero-spotlight.ts?raw';
import pricingTiersSource from '../../blocks/pricing-tiers/pricing-tiers.ts?raw';
import testimonialMarqueeSource from '../../blocks/testimonial-marquee/testimonial-marquee.ts?raw';

export const HERO_SPOTLIGHT_BLOCK = heroSpotlightSource;
export const FEATURE_BENTO_BLOCK = featureBentoSource;
export const PRICING_TIERS_BLOCK = pricingTiersSource;
export const TESTIMONIAL_MARQUEE_BLOCK = testimonialMarqueeSource;
export const CTA_MAGNETIC_BLOCK = ctaMagneticSource;
