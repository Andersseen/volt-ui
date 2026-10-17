import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFileRouter } from '@analogjs/router';
import { provideEtymaAnalog, withLocalizedRoutes } from '@etyma/analog';
import { provideEtyma } from '@etyma/angular';
import { provideMovement } from 'angular-movement';
import { MOTION } from './lib/motion';
import { appI18n } from './i18n/i18n';
import { provideSeo } from './lib/seo/seo.provider';
import { SITE_ORIGIN } from './lib/seo/site';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideFileRouter(withLocalizedRoutes()),
    provideAnimationsAsync(),
    provideEtyma(appI18n),
    provideEtymaAnalog({
      origin: SITE_ORIGIN,
    }),
    provideSeo(),
    // Every angular-movement directive inherits these unless it overrides them, so the
    // docs site has one motion signature instead of per-template magic numbers. The
    // library skips animating entirely under `prefers-reduced-motion: reduce`.
    provideMovement({
      duration: MOTION.duration,
      easing: MOTION.easing,
      delay: 0,
      disabled: false,
    }),
  ],
};
