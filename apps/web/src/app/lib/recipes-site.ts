/**
 * Where the copyable blocks, layouts and recipes live now.
 *
 * They are a separate application (`apps/recipes`, https://recipes.voltui.dev), so every link
 * from this site into them is an absolute URL on that origin. Components keep the visitor's
 * language: Recipes publishes the same locales under the same prefixes.
 */
export const RECIPES_ORIGIN = 'https://recipes.voltui.dev';

export function recipesUrl(locale: string, path = '/'): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const tail = path === '/' ? (prefix === '' ? '/' : '') : path;
  return `${RECIPES_ORIGIN}${prefix}${tail}`;
}
