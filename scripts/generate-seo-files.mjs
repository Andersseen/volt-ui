#!/usr/bin/env node
/**
 * Generates the crawler-facing files in `public/`:
 *
 *   robots.txt    allows public crawling (OAI-SearchBot included) and names the sitemap
 *   sitemap.xml   every indexable route, in every locale, with hreflang alternates
 *   llms.txt      a concise index for tools and agents that read the llms.txt convention
 *
 * Routes come from `src/app/lib/seo/seo-catalog.ts`, the same list the page head is built from,
 * so the sitemap, `llms.txt` and the metadata cannot disagree about which pages exist.
 * `lastmod` is left out: nothing in the repo records a reliable per-page modification date.
 *
 * `llms.txt` is an emerging convention for tools, not a ranking signal for any search engine.
 * What makes the site discoverable in search (including ChatGPT search, which uses OAI-SearchBot)
 * is that it is crawlable, which `robots.txt` keeps true.
 *
 * Usage: node scripts/generate-seo-files.mjs [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'vite';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

// Vite's SSR loader resolves the TypeScript catalog and its extensionless imports without a build.
const vite = await createServer({
  root: ROOT,
  configFile: false,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true, hmr: false, watch: null },
});
let site, catalog, project;
try {
  site = await vite.ssrLoadModule('/src/app/lib/seo/site.ts');
  catalog = await vite.ssrLoadModule('/src/app/lib/seo/seo-catalog.ts');
  project = await vite.ssrLoadModule('/src/app/i18n/project.ts');
} finally {
  await vite.close();
}
const { COMPONENT_GUIDES, GROUP_TITLES } = await import(
  pathToFileURL(join(ROOT, 'stories/_docs/component-guides.mjs')).href
);

const { SITE_NAME, SITE_ORIGIN, GITHUB_URL, NPM_PACKAGES, absoluteUrl, localizedPath } = site;
const { SEO_ENTRIES } = catalog;
const { I18N_PROJECT } = project;
const LOCALES = [...I18N_PROJECT.locales];
const SOURCE = I18N_PROJECT.sourceLocale;

const escapeXml = text =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function sitemap() {
  const urls = SEO_ENTRIES.map(entry => entry.path).map(bare => {
    const alternates = [
      ...LOCALES.map(
        locale =>
          `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(absoluteUrl(localizedPath(bare, locale)))}"/>`
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(localizedPath(bare, SOURCE)))}"/>`,
    ].join('\n');
    return LOCALES.map(
      locale =>
        `  <url>\n    <loc>${escapeXml(absoluteUrl(localizedPath(bare, locale)))}</loc>\n${alternates}\n  </url>`
    ).join('\n');
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

function robots() {
  return `# ${SITE_NAME} is a public open-source project: the documentation is meant to be found.
# Crawlers, including search and AI-search bots such as OAI-SearchBot, are welcome.
User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
}

const plain = text => text.replace(/`/g, '').replace(/\s+/g, ' ').trim();

function llms() {
  const byGroup = new Map();
  for (const [name, guide] of Object.entries(COMPONENT_GUIDES)) {
    if (!byGroup.has(guide.group)) byGroup.set(guide.group, []);
    byGroup.get(guide.group).push({ name, guide });
  }
  const componentLines = [...byGroup.entries()].map(([group, items]) => {
    const lines = items.map(
      ({ name, guide }) =>
        `- [${guide.title}](${absoluteUrl(`/docs/components/${name}`)}): ${plain(guide.summary)}`
    );
    return `### ${GROUP_TITLES[group]}\n\n${lines.join('\n')}`;
  });
  const slugOf = path => path.split('/').pop();
  const titleCase = slug =>
    slug
      .split('-')
      .map(w => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  const gallery = kind =>
    SEO_ENTRIES.filter(entry => entry.kind === kind)
      .map(entry => `- [${titleCase(slugOf(entry.path))}](${absoluteUrl(entry.path)})`)
      .join('\n');

  return `# ${SITE_NAME}

> Volt UI is an open-source Angular component library inspired by shadcn/ui and built on ng-primitives. Components use signals, are zoneless-compatible, are styled with Tailwind CSS v4 and focus on accessibility. Use the npm package or copy the source into your project with the CLI. The documentation is available in English, Spanish and Ukrainian.

Key facts:

- Framework: Angular (standalone components, \`OnPush\`, \`input()\` / \`output()\` / \`model()\`), no NgModules.
- Styling: Tailwind CSS v4 with CSS custom-property themes: five colour presets (volt, ember, sage, dusk, glacier), five style presets (sharp, soft, brutal, ghost, retro) and dark mode.
- Behaviour and accessibility: delegated to ng-primitives.
- Two ways to use it: **package mode** (\`@voltui/components\`, \`Volt*\` classes, \`volt-*\` selectors) and **copy-and-own mode** (\`npx @voltui/cli add <component>\`, \`Ui*\` classes, \`ui-*\` selectors).
- Licence: MIT. Source: ${GITHUB_URL}

## Start here

- [Introduction](${absoluteUrl('/docs/introduction')}): what Volt UI is and how to install it.
- [Components](${absoluteUrl('/docs/components')}): the full component catalog.
- [Themes](${absoluteUrl('/docs/themes')}): colour presets, style presets and dark mode.
- [Customization](${absoluteUrl('/docs/customization')}): editing copied components, variants and \`cn()\`.
- [Theme builder](${absoluteUrl('/create-theme')}): design and export a theme in the browser.
- [Versioning and stability](${absoluteUrl('/docs/versioning')}): semantic versioning and stable/beta labels.

## For AI coding agents

- [AI integration overview](${absoluteUrl('/docs/mcp')}): skill, MCP server and prompt reference.
- [MCP server](${absoluteUrl('/docs/ai-mcp')}): hosted Model Context Protocol server (endpoint: ${absoluteUrl('/api/mcp')}).
- [Local skill](${absoluteUrl('/docs/ai-skill')}): a skill file for Claude Code and OpenCode.
- [Prompt reference](${absoluteUrl('/docs/ai-prompt')}): a single-file prompt for any LLM chat.

## Components

${componentLines.join('\n\n')}

## Blocks, layouts and recipes

Blocks are whole page sections, layouts are application shells and recipes are tested workflows; all are copied into your project.

### Blocks

${gallery('block')}

### Layouts

${gallery('layout')}

### Recipes

${SEO_ENTRIES.filter(entry => entry.kind === 'recipe')
  .map(entry => `- [${entry.name}](${absoluteUrl(entry.path)})`)
  .join('\n')}

## Packages

${NPM_PACKAGES.map(pkg => `- [${pkg.name}](${pkg.url}): ${pkg.purpose}`).join('\n')}

## Optional

- [GitHub repository](${GITHUB_URL})
- [Component reference in Storybook](https://storybook.voltui.dev): interactive states, controls and accessibility checks.
- [Sitemap](${absoluteUrl('/sitemap.xml')})
`;
}

const files = {
  'public/robots.txt': robots(),
  'public/sitemap.xml': sitemap(),
  'public/llms.txt': llms(),
};

let stale = false;
for (const [path, content] of Object.entries(files)) {
  const full = join(ROOT, path);
  if (CHECK) {
    let current = '';
    try {
      current = readFileSync(full, 'utf8');
    } catch {
      /* missing counts as stale */
    }
    if (current !== content) {
      console.error(`[seo-files] ${path} is stale.`);
      stale = true;
    }
  } else {
    writeFileSync(full, content);
  }
}
if (CHECK) {
  if (stale) {
    console.error('Run `pnpm generate:seo-files` and commit the result.');
    process.exit(1);
  }
  console.log('[seo-files] up to date');
} else {
  console.log(
    `Wrote ${Object.keys(files).join(', ')} (${SEO_ENTRIES.length} routes × ${LOCALES.length} locales)`
  );
}
