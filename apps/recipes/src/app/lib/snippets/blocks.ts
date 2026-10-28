/**
 * Block sources, read straight off disk by Vite's `?raw` import.
 *
 * The point of going through the real file rather than a hand-written template literal:
 * the code on the page is the code running above it, so the two cannot drift. Editing a
 * block updates its documentation in the same commit, for free.
 */
import { toConsumerSource } from './consumer-source';
import appDashboardSource from '../../blocks/app-dashboard/app-dashboard.ts?raw';
import authLoginSource from '../../blocks/auth-login/auth-login.ts?raw';
import contactSplitSource from '../../blocks/contact-split/contact-split.ts?raw';
import ctaMagneticSource from '../../blocks/cta-magnetic/cta-magnetic.ts?raw';
import featureBentoSource from '../../blocks/feature-bento/feature-bento.ts?raw';
import footerSitemapSource from '../../blocks/footer-sitemap/footer-sitemap.ts?raw';
import heroSplitSource from '../../blocks/hero-split/hero-split.ts?raw';
import heroSpotlightSource from '../../blocks/hero-spotlight/hero-spotlight.ts?raw';
import pricingTiersSource from '../../blocks/pricing-tiers/pricing-tiers.ts?raw';
import serviceListSource from '../../blocks/service-list/service-list.ts?raw';
import testimonialMarqueeSource from '../../blocks/testimonial-marquee/testimonial-marquee.ts?raw';

export const HERO_SPOTLIGHT_BLOCK = toConsumerSource(heroSpotlightSource);
export const FEATURE_BENTO_BLOCK = toConsumerSource(featureBentoSource);
export const PRICING_TIERS_BLOCK = toConsumerSource(pricingTiersSource);
export const TESTIMONIAL_MARQUEE_BLOCK = toConsumerSource(testimonialMarqueeSource);
export const CTA_MAGNETIC_BLOCK = toConsumerSource(ctaMagneticSource);
export const HERO_SPLIT_BLOCK = toConsumerSource(heroSplitSource);
export const SERVICE_LIST_BLOCK = toConsumerSource(serviceListSource);
export const CONTACT_SPLIT_BLOCK = toConsumerSource(contactSplitSource);
export const FOOTER_SITEMAP_BLOCK = toConsumerSource(footerSitemapSource);
export const AUTH_LOGIN_BLOCK = toConsumerSource(authLoginSource);
export const APP_DASHBOARD_BLOCK = toConsumerSource(appDashboardSource);
