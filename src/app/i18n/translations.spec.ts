import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideEtyma, EtymaI18n } from '@etyma/angular';
import { defineI18n } from '@etyma/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { appI18n, injectAppI18n } from './i18n';

@Component({
  template: `<p data-testid="label">{{ t('nav.docs') }}</p>`,
})
class Host {
  protected readonly t = injectAppI18n().t;
}

describe('Etyma translations', () => {
  it('starts from the source locale', async () => {
    const { fixture } = await render(Host, { providers: [provideEtyma(appI18n)] });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    expect(translations.locale()).toBe('en');
  });

  it('re-renders a template when the language changes', async () => {
    const { fixture } = await render(Host, { providers: [provideEtyma(appI18n)] });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    expect(screen.getByTestId('label')).toHaveTextContent('Docs');

    await translations.setLocale('es');
    await fixture.whenStable();
    expect(screen.getByTestId('label')).toHaveTextContent('Documentación');

    await translations.setLocale('uk');
    await fixture.whenStable();
    expect(screen.getByTestId('label')).toHaveTextContent('Документація');
  });

  it('formats MF2 parameters', async () => {
    const { fixture } = await render(Host, { providers: [provideEtyma(appI18n)] });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    expect(translations.t('footer.rights', { year: 2026 })).toBe('© 2026');
  });

  it('keeps every link in the locale being read', async () => {
    const { fixture } = await render(Host, { providers: [provideEtyma(appI18n)] });
    const translations = fixture.debugElement.injector.get(EtymaI18n);

    expect(translations.path('/docs/components')).toBe('/docs/components');

    await translations.setLocale('uk');
    expect(translations.path('/docs/components')).toBe('/uk/docs/components');
  });

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
