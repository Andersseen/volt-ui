import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENTS } from '../component-metadata';
import { breadcrumbJsonLd, homeJsonLd, serializeJsonLd } from './json-ld';
import { plainText } from '@shared/seo/paths';
import { SEO_ENTRIES, seoEntryFor } from './seo-catalog';
import {
  absoluteUrl,
  barePath,
  GITHUB_URL,
  localeOfPath,
  localizedPath,
  NPM_PACKAGES,
  SITE_ORIGIN,
} from './site';

const ROOT = join(__dirname, '../../../..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

/** The origin the site used before voltui.dev. Written in pieces so this file does not contain it. */
const OLD_ORIGIN = ['volt-ui', 'andersseen', 'dev'].join('.');

describe('canonical origin', () => {
  it('is voltui.dev', () => {
    expect(SITE_ORIGIN).toBe('https://voltui.dev');
    expect(absoluteUrl('/docs')).toBe('https://voltui.dev/docs');
  });

  it('is the only production origin the repository emits', () => {
    const skip = new Set([
      'node_modules',
      'dist',
      '.git',
      '.angular',
      'coverage',
      '.wrangler',
      'test-results',
      'playwright-report',
    ]);
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (skip.has(name)) continue;
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (
          /\.(ts|mjs|js|json|md|mdx|html|txt|xml|yml|yaml|css)$/.test(name) &&
          statSync(path).size < 2_000_000
        ) {
          // CHANGELOG.md is history: a release note may mention the address it was written under.
          if (name === 'CHANGELOG.md' || name === 'pnpm-lock.yaml') continue;
          if (readFileSync(path, 'utf8').includes(OLD_ORIGIN))
            offenders.push(path.slice(ROOT.length + 1));
        }
      }
    };
    walk(ROOT);
    expect(offenders).toEqual([]);
  });

  it('is what every published package points to', () => {
    for (const path of [
      'projects/volt/package.json',
      'cli/package.json',
      'cli/agent/package.json',
    ]) {
      const manifest = JSON.parse(read(path)) as { homepage: string };
      expect(manifest.homepage, path).toMatch(/^https:\/\/voltui\.dev(\/|$)/);
    }
  });
});

describe('locale-aware paths', () => {
  it('knows which locale a path is written in', () => {
    expect(localeOfPath('/docs/components')).toBe('en');
    expect(localeOfPath('/es/docs/components')).toBe('es');
    expect(localeOfPath('/uk')).toBe('uk');
    // The source locale is only canonical without its prefix.
    expect(localeOfPath('/en/docs')).toBe('en');
  });

  it('strips the locale, trailing slash, query and fragment', () => {
    expect(barePath('/es/docs/components/button')).toBe('/docs/components/button');
    expect(barePath('/uk')).toBe('/');
    expect(barePath('/docs/components/?sort=name#api')).toBe('/docs/components');
    expect(barePath('/')).toBe('/');
  });

  it('builds the localized URL of a bare route', () => {
    expect(localizedPath('/docs', 'en')).toBe('/docs');
    expect(localizedPath('/docs', 'es')).toBe('/es/docs');
    expect(localizedPath('/', 'uk')).toBe('/uk');
  });
});

describe('seo catalog', () => {
  it('has no duplicate paths', () => {
    const paths = SEO_ENTRIES.map(entry => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('derives a page entry for every component, so a new one cannot be forgotten', () => {
    for (const component of COMPONENTS) {
      expect(seoEntryFor(component.path), component.name).toMatchObject({ kind: 'component' });
    }
  });

  it('keeps redirects, the API and locale prefixes out', () => {
    for (const { path } of SEO_ENTRIES) {
      expect(path).not.toMatch(/^\/(api|es|uk|en)(\/|$)/);
    }
    expect(seoEntryFor('/docs')).toBeUndefined();
    expect(seoEntryFor('/docs/layouts')).toBeUndefined();
  });

  it('does not advertise the pages that moved to Recipes', () => {
    for (const path of [
      '/docs/blocks',
      '/docs/blocks/hero',
      '/docs/layouts/sidebar',
      '/docs/recipes/async-search',
    ]) {
      expect(seoEntryFor(path), path).toBeUndefined();
    }
  });

  it('covers the landing, docs and theme builder', () => {
    for (const path of [
      '/',
      '/docs/introduction',
      '/docs/components',
      '/create-theme',
      '/docs/mcp',
      '/docs/components/combobox',
    ]) {
      expect(seoEntryFor(path), path).toBeDefined();
    }
  });
});

describe('structured data', () => {
  it('describes the site and the software with real URLs', () => {
    const [site, code] = homeJsonLd('A description.');
    expect(site).toMatchObject({ '@type': 'WebSite', url: 'https://voltui.dev/' });
    expect(code).toMatchObject({
      '@type': 'SoftwareSourceCode',
      codeRepository: GITHUB_URL,
      programmingLanguage: 'TypeScript',
    });
  });

  it('never claims ratings, reviews or prices', () => {
    const text = JSON.stringify(homeJsonLd('x'));
    expect(text).not.toMatch(/aggregateRating|review|offers|price/i);
  });

  it('builds ordered breadcrumbs with absolute URLs', () => {
    const list = breadcrumbJsonLd([
      { name: 'Volt UI', path: '/' },
      { name: 'Components', path: '/docs/components' },
    ]) as { itemListElement: { position: number; item: string }[] };
    expect(list.itemListElement.map(item => item.position)).toEqual([1, 2]);
    expect(list.itemListElement[1].item).toBe('https://voltui.dev/docs/components');
  });

  it('serializes to JSON that cannot close its own script element', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('plainText', () => {
  it('removes the prose marks a description key may carry', () => {
    expect(plainText('Use `cn()` and **bold** [docs](/docs/themes) now')).toBe(
      'Use cn() and bold docs now'
    );
  });
});

describe('crawler files', () => {
  it('robots.txt allows crawling, names the sitemap and does not block OAI-SearchBot', () => {
    const robots = read('public/robots.txt');
    expect(robots).toContain('Sitemap: https://voltui.dev/sitemap.xml');
    expect(robots).toMatch(/User-agent: \*\s+Allow: \//);
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
    expect(robots).not.toMatch(/OAI-SearchBot[\s\S]*Disallow/i);
  });

  it('sitemap.xml lists canonical localized routes and nothing internal', () => {
    const sitemap = read('public/sitemap.xml');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    expect(locs).toContain('https://voltui.dev/');
    expect(locs).toContain('https://voltui.dev/es');
    expect(locs).toContain('https://voltui.dev/docs/components/button');
    expect(locs).toContain('https://voltui.dev/es/docs/components/button');
    expect(locs).toContain('https://voltui.dev/uk/docs/introduction');
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs.filter(loc => /\/api\/|\?|#|\/en\//.test(loc))).toEqual([]);
    expect(sitemap).toContain(
      'hreflang="x-default" href="https://voltui.dev/docs/components/button"'
    );
    expect(sitemap).not.toContain('<lastmod>');
  });

  it('llms.txt points at the site, the repository, the components and the packages', () => {
    const llms = read('public/llms.txt');
    expect(llms).toMatch(/^# Volt UI/);
    expect(llms).toContain('https://voltui.dev/docs/components');
    expect(llms).toContain(GITHUB_URL);
    for (const pkg of NPM_PACKAGES) expect(llms).toContain(pkg.name);
    expect(llms).not.toMatch(/ranking factor|guarantee/i);
  });
});
