import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideEtyma, EtymaI18n } from '@etyma/angular';
import { defineI18n } from '@etyma/core';
import { render, screen } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appI18n, injectAppI18n, LOCALES, SOURCE_LOCALE } from './i18n';

/**
 * A small, representative stand-in for the real Glossa catalogs, keyed by the same URLs
 * `appI18n`'s loaders request. Deliberately not the real 766-key production content -
 * Glossa owns that, and these tests only need to prove Volt's own remote wiring works.
 */
const FIXTURE_CATALOGS: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  en: { nav: { docs: 'Docs' }, footer: { rights: '© {$year :number useGrouping=never}' } },
  es: { nav: { docs: 'Documentación' } },
  uk: { nav: { docs: 'Документація' } },
};

@Component({
  template: `<p data-testid="label">{{ t('nav.docs') }}</p>`,
})
class Host {
  protected readonly t = injectAppI18n().t;
}

describe("Volt's remote i18n config", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async (url: string) => {
      const locale = LOCALES.find(candidate => url.endsWith(`/${candidate}.json`));
      if (locale === undefined) {
        return { ok: false, status: 404, statusText: 'Not Found' } as Response;
      }
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => FIXTURE_CATALOGS[locale],
      } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests each locale from its Glossa delivery URL', async () => {
    const { fixture } = await render(Host, { providers: [provideEtyma(appI18n)] });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    await translations.activate('es');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://glossa.andersseen.dev/i18n/volt-ui/es.json',
      undefined
    );
  });

  it('renders the active locale once its catalog loads, and re-renders on switch', async () => {
    const { fixture } = await render(Host, { providers: [provideEtyma(appI18n)] });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    await translations.activate(SOURCE_LOCALE);
    await fixture.whenStable();
    expect(screen.getByTestId('label')).toHaveTextContent('Docs');

    await translations.setLocale('es');
    await fixture.whenStable();
    expect(screen.getByTestId('label')).toHaveTextContent('Documentación');

    await translations.setLocale('uk');
    await fixture.whenStable();
    expect(screen.getByTestId('label')).toHaveTextContent('Документація');
  });

  it('formats MF2 parameters from the loaded remote catalog', async () => {
    const { fixture } = await render(Host, { providers: [provideEtyma(appI18n)] });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    await translations.activate(SOURCE_LOCALE);

    expect(translations.t('footer.rights', { year: 2026 })).toBe('© 2026');
  });

  it('keeps every link in the locale being read', async () => {
    const { fixture } = await render(Host, { providers: [provideEtyma(appI18n)] });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    expect(translations.path('/docs/components')).toBe('/docs/components');

    await translations.activate('uk');
    expect(translations.path('/docs/components')).toBe('/uk/docs/components');
  });
});

describe('Etyma source fallback (engine behaviour Volt relies on)', () => {
  it('falls back to the source catalog when a secondary locale lacks a key', async () => {
    const fallbackI18n = defineI18n({
      locales: ['en', 'es'],
      sourceLocale: 'en',
      source: {
        greeting: 'Hello {$name}',
        missing: 'Source fallback',
      },
      loaders: {
        es: () => ({
          greeting: 'Hola {$name}',
        }),
      },
    });

    TestBed.configureTestingModule({ providers: [provideEtyma(fallbackI18n)] });

    const translations = TestBed.inject(EtymaI18n);
    await translations.setLocale('es');

    expect(translations.t('greeting', { name: 'Volt' })).toBe('Hola Volt');
    expect(translations.t('missing')).toBe('Source fallback');
  });
});
