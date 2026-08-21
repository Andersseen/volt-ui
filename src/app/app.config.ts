import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFileRouter, routes, withExtraRoutes } from '@analogjs/router';
import { provideMovement } from 'angular-movement';
import { MOTION } from './lib/motion';
import { LOCALES, DEFAULT_LOCALE } from './i18n/locales';
import { provideI18n } from './i18n/provide-i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    /*
     * English is served from the file routes at the root; the other locales mount the very
     * same route objects under a prefix, so `/es/docs/introduction` and
     * `/docs/introduction` resolve to one component and no page file is duplicated.
     * `routes` is Analog's generated array, so a page added tomorrow appears in all three
     * languages without anyone remembering to register it.
     */
    provideFileRouter(
      withExtraRoutes(
        LOCALES.filter(locale => locale !== DEFAULT_LOCALE).map(locale => ({
          path: locale,
          children: routes,
        }))
      )
    ),
    provideAnimationsAsync(),
    provideI18n(),
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
