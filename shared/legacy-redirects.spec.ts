import { describe, expect, it } from 'vitest';
import { CATALOG } from '../apps/recipes/src/app/lib/catalog';
import { legacyRedirects, legacyRouteRules, RECIPES_ORIGIN } from './legacy-redirects';
import { I18N_PROJECT } from './i18n/project';

const input = {
  locales: I18N_PROJECT.locales,
  sourceLocale: I18N_PROJECT.sourceLocale,
  entries: CATALOG,
};
const rules = legacyRedirects(input);
const byFrom = new Map(rules.map(rule => [rule.from, rule.to]));

describe('legacy redirects to Volt UI Recipes', () => {
  it('maps the documented examples', () => {
    expect(byFrom.get('/docs/blocks/hero')).toBe(`${RECIPES_ORIGIN}/blocks/hero`);
    expect(byFrom.get('/docs/layouts/kanban')).toBe(`${RECIPES_ORIGIN}/layouts/kanban`);
    expect(byFrom.get('/docs/recipes/async-search')).toBe(`${RECIPES_ORIGIN}/recipes/async-search`);
  });

  it('keeps the visitor in their language', () => {
    expect(byFrom.get('/es/docs/blocks/hero')).toBe(`${RECIPES_ORIGIN}/es/blocks/hero`);
    expect(byFrom.get('/uk/docs/layouts')).toBe(`${RECIPES_ORIGIN}/uk/layouts`);
  });

  it('redirects every published path of every catalog entry, in every locale', () => {
    for (const entry of CATALOG) {
      for (const locale of I18N_PROJECT.locales) {
        const prefix = locale === I18N_PROJECT.sourceLocale ? '' : `/${locale}`;
        const old = `${prefix}/docs${entry.path}`;
        expect(byFrom.get(old), old).toBe(`${RECIPES_ORIGIN}${prefix}${entry.path}`);
      }
    }
  });

  it('redirects the section indexes too', () => {
    for (const kind of ['blocks', 'layouts', 'recipes']) {
      expect(byFrom.get(`/docs/${kind}`)).toBe(`${RECIPES_ORIGIN}/${kind}`);
    }
  });

  it('only points at routes the Recipes catalog serves', () => {
    const served = new Set([
      '/blocks',
      '/layouts',
      '/recipes',
      ...CATALOG.map(entry => entry.path),
    ]);
    for (const { to } of rules) {
      const path = to.slice(RECIPES_ORIGIN.length).replace(/^\/(es|uk)(?=\/|$)/, '') || '/';
      expect(served.has(path), to).toBe(true);
    }
  });

  it('never captures an unrelated documentation or API route', () => {
    for (const { from } of rules) {
      expect(from).toMatch(/^(\/(es|uk))?\/docs\/(blocks|layouts|recipes)(\/[a-z-]+)?$/);
      expect(from).not.toMatch(/components|api|introduction|\*/);
    }
  });

  it('has one permanent rule per old path and no duplicates', () => {
    expect(new Set(rules.map(rule => rule.from)).size).toBe(rules.length);
    for (const rule of Object.values(legacyRouteRules(input))) {
      expect(rule.redirect.statusCode).toBe(301);
    }
  });
});
