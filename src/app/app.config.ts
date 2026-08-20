import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFileRouter } from '@analogjs/router';
import { provideMovement } from 'angular-movement';
import { MOTION } from './lib/motion';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideFileRouter(),
    provideAnimationsAsync(),
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
