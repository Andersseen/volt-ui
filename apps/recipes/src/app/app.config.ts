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
import { appI18n } from '@shared/i18n/i18n';
import { MOTION } from '@shared/lib/motion';
import { SITE_IDENTITY } from '@shared/seo/seo.service';
import { provideSeo } from './lib/seo/seo.provider';
import { SITE_IDENTITY_VALUE, SITE_ORIGIN } from './lib/site';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideFileRouter(withLocalizedRoutes()),
    provideAnimationsAsync(),
    provideEtyma(appI18n),
    // Canonical and hreflang are written against this app's own origin, never the docs site's.
    provideEtymaAnalog({ origin: SITE_ORIGIN }),
    { provide: SITE_IDENTITY, useValue: SITE_IDENTITY_VALUE },
    provideSeo(),
    // Blocks animate with angular-movement; the docs site's motion signature applies here too.
    provideMovement({
      duration: MOTION.duration,
      easing: MOTION.easing,
      delay: 0,
      disabled: false,
    }),
  ],
};
