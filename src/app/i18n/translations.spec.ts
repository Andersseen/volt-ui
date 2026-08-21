import { Component, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Translations } from './translations';

@Component({
  template: `<p data-testid="label">{{ t('nav.docs') }}</p>`,
})
class Host {
  protected readonly t = inject(Translations).t;
}

@Component({ template: 'page' })
class Page {}

const routes = [
  { path: 'docs/introduction', component: Page },
  { path: 'es/docs/introduction', component: Page },
  { path: 'uk/docs/introduction', component: Page },
];

describe('Translations', () => {
  it('reads the locale out of the URL rather than storing it', async () => {
    const { fixture } = await render(Host, { providers: [provideRouter(routes)] });
    const router = fixture.debugElement.injector.get(Router);
    const translations = fixture.debugElement.injector.get(Translations);

    await router.navigateByUrl('/es/docs/introduction');
    expect(translations.locale()).toBe('es');

    await router.navigateByUrl('/docs/introduction');
    expect(translations.locale()).toBe('en');
  });

  it('re-renders a template when the language changes', async () => {
    const { fixture } = await render(Host, { providers: [provideRouter(routes)] });
    const router = fixture.debugElement.injector.get(Router);

    expect(screen.getByTestId('label')).toHaveTextContent('Docs');

    await router.navigateByUrl('/es/docs/introduction');
    await fixture.whenStable();
    expect(screen.getByTestId('label')).toHaveTextContent('Documentación');

    await router.navigateByUrl('/uk/docs/introduction');
    await fixture.whenStable();
    expect(screen.getByTestId('label')).toHaveTextContent('Документація');
  });

  it('substitutes named placeholders', async () => {
    const { fixture } = await render(Host, { providers: [provideRouter(routes)] });
    const translations = fixture.debugElement.injector.get(Translations);

    expect(translations.t('footer.rights', { year: 2026 })).toBe('© 2026');
  });

  it('leaves a placeholder alone when nothing was passed for it', async () => {
    const { fixture } = await render(Host, { providers: [provideRouter(routes)] });
    const translations = fixture.debugElement.injector.get(Translations);

    // Better a visible `{year}` than a sentence that quietly loses its subject.
    expect(translations.t('footer.rights')).toBe('© {year}');
  });

  it('keeps every link in the locale being read', async () => {
    const { fixture } = await render(Host, { providers: [provideRouter(routes)] });
    const router = fixture.debugElement.injector.get(Router);
    const translations = fixture.debugElement.injector.get(Translations);

    expect(translations.path('/docs/components')).toBe('/docs/components');

    await router.navigateByUrl('/uk/docs/introduction');
    expect(translations.path('/docs/components')).toBe('/uk/docs/components');
  });
});
