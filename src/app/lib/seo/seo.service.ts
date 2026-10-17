import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { serializeJsonLd, type JsonLd } from './json-ld';
import { OG_LOCALES, SITE_NAME, SOCIAL_IMAGE, absoluteUrl } from './site';

export interface PageSeo {
  readonly title: string;
  readonly description: string;
  /** Absolute canonical URL of the page itself, in its own language. */
  readonly url: string;
  readonly locale: string;
  readonly locales: readonly string[];
  readonly imageAlt: string;
  readonly jsonLd?: readonly JsonLd[];
  /** Set only to keep a page out of the index (for example a 404); omitted pages are indexable. */
  readonly robots?: string;
}

const JSON_LD_SELECTOR = 'script[data-seo="json-ld"]';

/**
 * Writes the search and social head for a page: title, description, Open Graph, Twitter and
 * JSON-LD. Runs during server rendering, so the tags are in the HTML a crawler receives.
 *
 * It does not touch `<html lang>`, the canonical link or `hreflang`: `@etyma/analog` owns those
 * (see `provideEtymaAnalog` in `app.config.ts`), and a second writer is how pages end up with
 * two canonicals.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(page: PageSeo): void {
    const image = absoluteUrl(SOCIAL_IMAGE.path);

    this.titleService.setTitle(page.title);

    this.name('description', page.description);

    this.property('og:site_name', SITE_NAME);
    this.property('og:type', 'website');
    this.property('og:title', page.title);
    this.property('og:description', page.description);
    this.property('og:url', page.url);
    this.property('og:image', image);
    this.property('og:image:width', String(SOCIAL_IMAGE.width));
    this.property('og:image:height', String(SOCIAL_IMAGE.height));
    this.property('og:image:alt', page.imageAlt);
    this.property('og:locale', OG_LOCALES[page.locale] ?? page.locale);
    this.alternateLocales(page);

    this.name('twitter:card', 'summary_large_image');
    this.name('twitter:title', page.title);
    this.name('twitter:description', page.description);
    this.name('twitter:image', image);
    this.name('twitter:image:alt', page.imageAlt);

    if (page.robots) this.name('robots', page.robots);
    else this.meta.removeTag('name="robots"');

    this.jsonLd(page.jsonLd ?? []);
  }

  private name(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private property(property: string, content: string): void {
    this.meta.updateTag({ property, content }, `property="${property}"`);
  }

  /** One `og:locale:alternate` per other language; stale ones from the previous page are removed. */
  private alternateLocales(page: PageSeo): void {
    for (const element of Array.from(
      this.document.head.querySelectorAll('meta[property="og:locale:alternate"]')
    )) {
      element.remove();
    }
    for (const locale of page.locales) {
      if (locale === page.locale) continue;
      this.meta.addTag({ property: 'og:locale:alternate', content: OG_LOCALES[locale] ?? locale });
    }
  }

  private jsonLd(data: readonly JsonLd[]): void {
    const head = this.document.head;
    for (const stale of Array.from(head.querySelectorAll(JSON_LD_SELECTOR))) {
      stale.remove();
    }
    if (data.length === 0) return;
    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo', 'json-ld');
    script.textContent = serializeJsonLd(data.length === 1 ? data[0] : data);
    head.appendChild(script);
  }
}
