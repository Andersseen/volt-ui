import type { Routes } from '@angular/router';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { doqRoutes, provideDoq } from '@doqs/analog';
import { withEtymaLocale } from '@shared/doqs/etyma-doq-i18n';
import { doqConfig } from './doq.config';
import { provideSiteDoqI18n } from './doq-messages';

/**
 * The documentation region, loaded only when a URL is under `/docs` (see `doq-region.ts`).
 *
 * Everything Doqs needs lives on this lazily loaded route: its configuration with the demos and
 * playgrounds, the Markdown renderer and the Etyma adapter. `doqRoutes()` claims only the URLs that
 * have a Markdown document (`unmatched: 'continue'`); any other `/docs/*` URL finds no child here and
 * the router carries on to the host's own file routes.
 */
export const DOQ_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideContent(withMarkdownRenderer()),
      provideDoq(doqConfig),
      provideSiteDoqI18n(),
    ],
    children: withEtymaLocale(doqRoutes(doqConfig)),
  },
];
