import { describe, expect, it } from 'vitest';
import { currentIndex, flattenLinks, pathOf, slugFor } from './docs-nav';

const links = [
  { path: '/docs/components', exact: true },
  { path: '/docs/components/button' },
  { path: '/docs/recipes' },
];
const identity = (path: string) => path;

describe('docs navigation helpers', () => {
  it('flattens groups in sidebar order', () => {
    expect(
      flattenLinks([{ links: [links[0]] }, { links: [links[1], links[2]] }]).map(l => l.path)
    ).toEqual(['/docs/components', '/docs/components/button', '/docs/recipes']);
  });

  it('strips query, fragment and trailing slash', () => {
    expect(pathOf('/docs/x/?a=1#b')).toBe('/docs/x');
    expect(pathOf('/')).toBe('/');
  });

  it('finds the exact page, then the closest section for nested pages', () => {
    expect(currentIndex(links, '/docs/components/button#api', identity)).toBe(1);
    expect(currentIndex(links, '/docs/recipes/settings-form', identity)).toBe(2);
    // An `exact` link never claims the pages beneath it.
    expect(currentIndex(links, '/docs/components/unknown', identity)).toBe(-1);
  });

  it('compares against the localized link', () => {
    const es = (path: string) => `/es${path}`;
    expect(currentIndex(links, '/es/docs/components/button', es)).toBe(1);
  });

  it('makes readable, unique, accent-free fragments', () => {
    const taken = new Set<string>();
    expect(slugFor('Instalación rápida', taken)).toBe('instalacion-rapida');
    expect(slugFor('Instalación rápida', taken)).toBe('instalacion-rapida-2');
    expect(slugFor('Встановлення', taken)).toBe('встановлення');
    expect(slugFor('!!!', taken)).toBe('section');
  });
});
