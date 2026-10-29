import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { provideFileRouter, withExtraRoutes } from '@analogjs/router';
import { defineDoqConfig, doqRoutes, provideDoq } from '@doqs/analog';
import { provideEtymaAnalog, withLocalizedRoutes } from '@etyma/analog';
import { provideEtyma } from '@etyma/angular';
import { provideMovement } from 'angular-movement';
import { appI18n } from '@shared/i18n/i18n';
import { doqPaths } from '../doq.paths';
import { AsyncSearchRecipe } from './recipes/async-search/async-search';
import { provideEtymaDoqI18n, withEtymaLocale } from './lib/doq-i18n';
import { MOTION } from '@shared/lib/motion';
import { SITE_IDENTITY } from '@shared/seo/seo.service';
import { provideSeo } from './lib/seo/seo.provider';
import { SITE_IDENTITY_VALUE, SITE_ORIGIN } from './lib/site';

/**
 * The documentation region (https://github.com/Andersseen/doqs). Doqs owns the Markdown pages below
 * /docs; the header, footer, theme and language switch stay this app's. `landmark: 'host'` because
 * app.ts already renders the one `<main>`. An unknown /docs URL
 * gets Doqs's own not-found view (the page head marks it noindex in seo.provider.ts).
 */
export const doqConfig = defineDoqConfig({
  ...doqPaths,
  landmark: 'host',
  // A live recipe inside a guide: `::demo[async-search]`.
  demos: { 'async-search': AsyncSearchRecipe },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    // Doqs routes first: Analog also turns every Markdown file into a route, and a catch-all such as
    // the locale wrapper registered ahead of Doqs would answer with the raw page and no navigation.
    provideFileRouter(
      withExtraRoutes(withEtymaLocale(doqRoutes(doqConfig))),
      withLocalizedRoutes()
    ),
    provideContent(withMarkdownRenderer()),
    provideDoq(doqConfig),
    provideEtymaDoqI18n(),
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
