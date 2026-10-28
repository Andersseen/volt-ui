#!/usr/bin/env node
/**
 * Fetches representative pages from a running server and checks the raw, pre-JavaScript HTML
 * that a crawler sees: title, description, canonical, hreflang, Open Graph, Twitter, JSON-LD and
 * document language, plus `robots.txt`, `sitemap.xml` and `llms.txt`.
 *
 * Why the raw response and not the DOM: the metadata is written during server rendering, and a
 * browser test would pass even if it only appeared after hydration.
 *
 * Checks either application, each against its own origin and its own crawler files:
 *
 *   node scripts/check-seo.mjs                                   # Volt UI (voltui.dev), served from dist/analog
 *   node scripts/check-seo.mjs --app recipes                     # Recipes (recipes.voltui.dev), from dist/apps/recipes
 *   node scripts/check-seo.mjs --url http://localhost:5173       # an already running server
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const appArg = process.argv.indexOf('--app');
const APP = appArg > -1 ? process.argv[appArg + 1] : 'docs';
if (!['docs', 'recipes'].includes(APP)) {
  console.error('--app must be "docs" or "recipes"');
  process.exit(1);
}
const RECIPES = APP === 'recipes';
const ORIGIN = RECIPES ? 'https://recipes.voltui.dev' : 'https://voltui.dev';
const OTHER_ORIGIN = RECIPES ? 'https://voltui.dev' : 'https://recipes.voltui.dev';
const SITE_NAME = RECIPES ? 'Volt UI Recipes' : 'Volt UI';
const OUTPUT = RECIPES ? 'dist/apps/recipes/analog/public' : 'dist/analog/public';
// Written in pieces so this file is not itself a hit for the old-origin regression test.
const OLD_ORIGIN = ['volt-ui', 'andersseen', 'dev'].join('.');
const PORT = RECIPES ? 8797 : 8798;

const urlArg = process.argv.indexOf('--url');
let base = urlArg > -1 ? process.argv[urlArg + 1] : `http://127.0.0.1:${PORT}`;
let server;

if (urlArg === -1) {
  server = spawn(
    join(ROOT, 'node_modules/.bin/wrangler'),
    ['pages', 'dev', OUTPUT, '--ip', '127.0.0.1', '--port', String(PORT)],
    { cwd: ROOT, env: { ...process.env, NO_COLOR: '1' }, stdio: 'ignore' }
  );
}

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

async function get(path, attempts = 40) {
  if (process.env.SEO_DEBUG) console.error('GET', path);
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(base + path, { redirect: 'manual' });
      if (response.status < 500 || i === attempts - 1) {
        return {
          status: response.status,
          type: response.headers.get('content-type') ?? '',
          headers: response.headers,
          text: await response.text(),
        };
      }
    } catch {
      /* server still starting */
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

const tag = (html, pattern) => [...html.matchAll(pattern)].map(match => match[1]);
const metaContent = (html, key, value) => {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (match[0].includes(`${key}="${value}"`)) return match[0].match(/\scontent="([^"]*)"/)?.[1];
  }
};
const metas = (html, key, value) =>
  [...html.matchAll(/<meta\b[^>]*>/gi)]
    .filter(match => match[0].includes(`${key}="${value}"`))
    .map(match => match[0].match(/\scontent="([^"]*)"/)?.[1]);

const PAGES = RECIPES
  ? [
      { path: '/', lang: 'en', title: /Volt UI Recipes/, home: true },
      { path: '/blocks', lang: 'en', title: /Blocks/ },
      { path: '/blocks/pricing', lang: 'en', title: /Pricing Tiers/, breadcrumbs: true },
      { path: '/layouts', lang: 'en', title: /Layouts/ },
      { path: '/layouts/kanban', lang: 'en', title: /Kanban/, breadcrumbs: true },
      { path: '/recipes', lang: 'en', title: /Recipes/ },
      { path: '/recipes/async-search', lang: 'en', title: /Async search/, breadcrumbs: true },
      { path: '/es/blocks/pricing', lang: 'es', title: /Bloque Pricing Tiers/, breadcrumbs: true },
      { path: '/uk/layouts', lang: 'uk', title: /Макети/ },
    ]
  : [
      { path: '/', lang: 'en', title: /Volt UI/, home: true },
      { path: '/docs/components', lang: 'en', title: /Components/ },
      { path: '/docs/components/button', lang: 'en', title: /Button/, breadcrumbs: true },
      { path: '/docs/components/dialog', lang: 'en', title: /Dialog/, breadcrumbs: true },
      { path: '/docs/introduction', lang: 'en', title: /Documentation/ },
      { path: '/create-theme', lang: 'en', title: /Theme/ },
      {
        path: '/es/docs/components/dialog',
        lang: 'es',
        title: /Componente Dialog/,
        breadcrumbs: true,
      },
      { path: '/uk/docs/introduction', lang: 'uk', title: /Документація/ },
    ];
const LOCALES = ['en', 'es', 'uk'];
const withLocale = (bare, locale) =>
  locale === 'en' ? bare : bare === '/' ? `/${locale}` : `/${locale}${bare}`;

const titles = new Map();
// `--skip /path` leaves a page out. The docs index renders an open Accordion, and under `vite dev`
// ng-primitives' MutationObserver call on the server takes the whole dev process down (the built
// worker only logs it; see KNOWN in check-ssr.mjs). CI runs against the worker, so it skips nothing.
const skipped = process.argv.flatMap((arg, i) => (arg === '--skip' ? [process.argv[i + 1]] : []));
for (const page of PAGES.filter(page => !skipped.includes(page.path))) {
  const result = await get(page.path);
  const where = page.path;
  if (!result || result.status !== 200) {
    fail(where, `expected 200, got ${result?.status}`);
    continue;
  }
  const html = result.text;
  const head = html.slice(0, html.indexOf('</head>'));
  const bare = page.path.replace(/^\/(es|uk)(?=\/|$)/, '') || '/';
  const expectedCanonical = `${ORIGIN}${page.path === '/' ? '/' : page.path}`;

  if (!new RegExp(`<html[^>]*\\slang="${page.lang}"`).test(html))
    fail(where, `html lang is not ${page.lang}`);

  const title = tag(head, /<title>([^<]*)<\/title>/g);
  if (title.length !== 1) fail(where, `${title.length} <title> elements`);
  else {
    if (!page.title.test(title[0])) fail(where, `unexpected title "${title[0]}"`);
    if (title[0] === 'Volt UI' && !RECIPES) fail(where, 'title is the generic default');
    if (titles.has(title[0])) fail(where, `title duplicates ${titles.get(title[0])}`);
    titles.set(title[0], where);
  }

  const description = metas(head, 'name', 'description');
  if (description.length !== 1) fail(where, `${description.length} meta descriptions`);
  else if (description[0].length < 50 || description[0].length > 220)
    fail(where, `description length ${description[0].length}`);

  const canonical = [...head.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g)].map(
    match => match[0].match(/href="([^"]*)"/)?.[1]
  );
  if (canonical.length !== 1) fail(where, `${canonical.length} canonical links`);
  else if (canonical[0] !== expectedCanonical)
    fail(where, `canonical ${canonical[0]} !== ${expectedCanonical}`);

  const alternates = [...head.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/g)].map(m => ({
    lang: m[0].match(/hreflang="([^"]*)"/)?.[1],
    href: m[0].match(/href="([^"]*)"/)?.[1],
  }));
  for (const locale of LOCALES) {
    const hit = alternates.find(a => a.lang === locale);
    const expected = `${ORIGIN}${withLocale(bare, locale)}`;
    if (hit?.href !== expected)
      fail(where, `hreflang ${locale} is ${hit?.href}, expected ${expected}`);
  }
  if (alternates.find(a => a.lang === 'x-default')?.href !== `${ORIGIN}${bare}`)
    fail(where, 'x-default missing or wrong');
  if (alternates.length !== LOCALES.length + 1) fail(where, `${alternates.length} alternate links`);

  for (const [key, value] of [
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:image'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
  ]) {
    if (metas(head, key, value).length !== 1)
      fail(where, `${value} appears ${metas(head, key, value).length} times`);
  }
  if (metaContent(head, 'property', 'og:url') !== expectedCanonical)
    fail(where, 'og:url differs from canonical');
  if (metaContent(head, 'property', 'og:type') !== 'website') fail(where, 'og:type is not website');
  if (metaContent(head, 'property', 'og:site_name') !== SITE_NAME) fail(where, 'og:site_name');
  if (metaContent(head, 'name', 'twitter:card') !== 'summary_large_image')
    fail(where, 'twitter:card');
  for (const image of [
    metaContent(head, 'property', 'og:image'),
    metaContent(head, 'name', 'twitter:image'),
  ]) {
    if (!image?.startsWith(`${ORIGIN}/`)) fail(where, `social image ${image} is not on ${ORIGIN}`);
  }
  if (metaContent(head, 'name', 'robots'))
    fail(where, 'an indexable page carries a robots meta tag');

  const jsonLd = tag(head, /<script[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/g);
  if (page.home || page.breadcrumbs) {
    if (jsonLd.length !== 1) fail(where, `${jsonLd.length} JSON-LD scripts`);
    else {
      try {
        const data = JSON.parse(jsonLd[0]);
        const types = (Array.isArray(data) ? data : [data]).map(item => item['@type']);
        const wanted = page.home
          ? RECIPES
            ? ['WebSite']
            : ['WebSite', 'SoftwareSourceCode']
          : ['BreadcrumbList'];
        for (const type of wanted) if (!types.includes(type)) fail(where, `JSON-LD lacks ${type}`);
      } catch (error) {
        fail(where, `JSON-LD is not valid JSON: ${error.message}`);
      }
    }
  } else if (jsonLd.length > 0) {
    fail(where, 'unexpected JSON-LD');
  }

  if (html.includes(OLD_ORIGIN)) fail(where, `contains the old origin ${OLD_ORIGIN}`);
  // Each site's own canonical, alternates and social tags stay on its own origin.
  if (
    head.includes(`"${OTHER_ORIGIN}/`) &&
    /rel="(canonical|alternate)"[^>]*href="https:\/\/(voltui|recipes\.voltui)\.dev/.test(head)
  ) {
    for (const m of head.matchAll(/<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/g)) {
      if (m[0].includes(OTHER_ORIGIN)) fail(where, `${m[0]} points at ${OTHER_ORIGIN}`);
    }
  }
  if (!/<h1\b/.test(html)) fail(where, 'no <h1> in the server-rendered HTML');
}

// A path no page claims must not look like content to a crawler.
const missing = await get('/this-page-does-not-exist');
if (!missing || !/name="robots" content="noindex/.test(missing.text))
  fail('/this-page-does-not-exist', 'no noindex robots meta');

const homepage = await get('/');
for (const [header, expected] of [
  ['x-content-type-options', 'nosniff'],
  ['referrer-policy', 'strict-origin-when-cross-origin'],
  ['x-frame-options', 'DENY'],
  ['permissions-policy', 'camera=(), microphone=(), geolocation=()'],
]) {
  if (homepage?.headers.get(header)?.toLowerCase() !== expected.toLowerCase())
    fail('/', `${header} is missing or incorrect`);
}
// The worker answers 200 for the empty shell whatever status the render sets, so `noindex` above is what
// keeps it out of the index; the status is not asserted.

const robots = await get('/robots.txt');
if (robots?.status !== 200 || !robots.type.startsWith('text/plain'))
  fail('/robots.txt', `status ${robots?.status} type ${robots?.type}`);
else {
  if (!robots.text.includes(`Sitemap: ${ORIGIN}/sitemap.xml`))
    fail('/robots.txt', 'does not reference the sitemap');
  if (/Disallow:\s*\/\s*$/m.test(robots.text)) fail('/robots.txt', 'disallows the whole site');
  if (/OAI-SearchBot[\s\S]*?Disallow/i.test(robots.text))
    fail('/robots.txt', 'blocks OAI-SearchBot');
}

const sitemap = await get('/sitemap.xml');
if (sitemap?.status !== 200 || !/xml/.test(sitemap.type))
  fail('/sitemap.xml', `status ${sitemap?.status} type ${sitemap?.type}`);
else {
  const locs = tag(sitemap.text, /<loc>([^<]*)<\/loc>/g);
  for (const wanted of RECIPES
    ? [
        '/',
        '/blocks/hero',
        '/layouts/kanban',
        '/recipes/data-table',
        '/es/blocks/pricing',
        '/uk/recipes',
      ]
    : [
        '/',
        '/es/docs/components/button',
        '/uk/docs/introduction',
        '/docs/components/dialog',
        '/create-theme',
      ]) {
    if (!locs.includes(`${ORIGIN}${wanted}`)) fail('/sitemap.xml', `missing ${wanted}`);
  }
  // The pages that moved are advertised by exactly one site: their new home.
  if (!RECIPES && locs.some(loc => /\/docs\/(blocks|layouts|recipes)(\/|$)/.test(loc)))
    fail('/sitemap.xml', 'still advertises pages that moved to Recipes');
  if (locs.some(loc => loc.startsWith(OTHER_ORIGIN)))
    fail('/sitemap.xml', `lists ${OTHER_ORIGIN} URLs`);
  if (locs.some(loc => !loc.startsWith(`${ORIGIN}/`) || /\/api\/|\?|#/.test(loc)))
    fail('/sitemap.xml', 'contains a non-canonical or internal URL');
  if (new Set(locs).size !== locs.length) fail('/sitemap.xml', 'contains duplicate URLs');
}

const llms = await get('/llms.txt');
if (llms?.status !== 200 || !llms.type.startsWith('text/plain'))
  fail('/llms.txt', `status ${llms?.status} type ${llms?.type}`);
else
  for (const wanted of RECIPES
    ? [
        ORIGIN,
        'https://github.com/Andersseen/volt-ui',
        `${ORIGIN}/blocks/hero`,
        'https://voltui.dev',
      ]
    : [
        ORIGIN,
        'https://github.com/Andersseen/volt-ui',
        '@voltui/components',
        `${ORIGIN}/docs/components`,
      ]) {
    if (!llms.text.includes(wanted)) fail('/llms.txt', `lacks ${wanted}`);
  }

const og = await get('/og.png');
if (og?.status !== 200 || og.type !== 'image/png')
  fail('/og.png', `status ${og?.status} type ${og?.type}`);

server?.kill();
if (problems.length) {
  console.error(`[check-seo] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(
  `[check-seo] ${PAGES.length - skipped.length} pages, robots.txt, sitemap.xml, llms.txt and og.png are correct in the raw HTML`
);
