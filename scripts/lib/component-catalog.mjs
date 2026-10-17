import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FOUNDATION_ONLY, publicComponents } from './public-components.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** `| name | status |` rows of COMPONENT_STATUS.md — the one hand-maintained copy of the status. */
function statuses() {
  const table = readFileSync(join(ROOT, 'COMPONENT_STATUS.md'), 'utf8');
  const map = new Map();
  for (const m of table.matchAll(
    /^\|\s*([a-z][a-z0-9-]*)\s*\|\s*(stable|beta|experimental)\s*\|/gm
  )) {
    map.set(m[1], m[2]);
  }
  return map;
}

/**
 * What each public component is for, derived from the sources that already hold it:
 * the Storybook guide prose (summary, when to use, where it stops) and COMPONENT_STATUS.md
 * (status). Feeds the MCP `find_components` tool and the generated catalog in the
 * `volt-ui-component-selection` skill, so neither is a second hand-written copy.
 *
 * @returns {Promise<{ key: string; title: string; category: string; status: string; summary: string; useWhen: string[]; notFor: string[]; related: string[] }[]>}
 */
export async function loadCatalog() {
  const { COMPONENT_GUIDES, COMPONENT_RELATIONS, GROUP_TITLES } = await import(
    pathToFileURL(join(ROOT, 'stories/_docs/component-guides.mjs')).href
  );
  const status = statuses();
  const foundations = [...FOUNDATION_ONLY].map(key => ({
    key,
    title: 'Theme',
    category: 'Foundations',
    status: status.get(key) ?? 'stable',
    summary:
      'Colour and style presets and the functions that apply them: provideVoltTheme at bootstrap, applyVoltTheme at runtime.',
    useWhen: ['Setting the look of the whole app, or switching preset or dark mode at runtime.'],
    notFor: ['Restyling one component: use its variants or `class`.'],
    related: [],
  }));
  const components = publicComponents().map(key => {
    const guide = COMPONENT_GUIDES[key];
    if (!guide) throw new Error(`component-catalog: no guide for public component "${key}"`);
    if (!status.has(key))
      throw new Error(`component-catalog: "${key}" has no row in COMPONENT_STATUS.md`);
    const relations = COMPONENT_RELATIONS[key] ?? { notFor: [], related: [] };
    for (const other of relations.related) {
      if (!COMPONENT_GUIDES[other]) {
        throw new Error(`component-catalog: "${key}" relates to unknown component "${other}"`);
      }
    }
    return {
      key,
      title: guide.title,
      category: GROUP_TITLES[guide.group],
      status: status.get(key),
      summary: guide.summary,
      useWhen: guide.when,
      notFor: relations.notFor,
      related: relations.related,
    };
  });
  return [...components, ...foundations];
}
