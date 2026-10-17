#!/usr/bin/env node
/**
 * Storybook coverage guard: adding a public component without a Storybook representation fails here.
 *
 * For every component or layout exported from `projects/volt/src/public-api.ts` (minus `theme`,
 * which is documented under Foundations) it requires:
 *
 *   - `stories/components/<name>.stories.ts` with at least one story export,
 *   - a literal CSF `title` of `Components/<group>/<title>` that matches the guide data,
 *   - imports through the public `volt` surface, never `projects/volt/src/lib/...`,
 *   - the generated docs page (checked separately by `generate-storybook-docs.mjs --check`),
 *
 * and it rejects stories files whose component is not public, and a missing Foundations page.
 *
 * Usage: node scripts/check-storybook.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { publicComponents } from './lib/public-components.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STORIES = join(ROOT, 'stories/components');
const { COMPONENT_GUIDES, GROUP_TITLES } = await import(
  pathToFileURL(join(ROOT, 'stories/_docs/component-guides.mjs')).href
);

const FOUNDATIONS = ['introduction', 'installation', 'package-vs-copy', 'theming', 'accessibility'];
const problems = [];
const components = publicComponents();

for (const name of components) {
  const file = join(STORIES, `${name}.stories.ts`);
  if (!existsSync(file)) {
    problems.push(`${name}: missing stories/components/${name}.stories.ts`);
    continue;
  }
  const src = readFileSync(file, 'utf8');
  const guide = COMPONENT_GUIDES[name];
  const title = src.match(/const meta[^=]*=\s*\{\s*title:\s*'([^']+)'/)?.[1];
  const expected = guide && `Components/${GROUP_TITLES[guide.group]}/${guide.title}`;
  if (!title) problems.push(`${name}: the stories file needs a literal \`title\``);
  else if (title !== expected) problems.push(`${name}: title "${title}" should be "${expected}"`);
  if (!/^export const \w+\s*:\s*Story\b/m.test(src)) problems.push(`${name}: no story exports`);
  if (!/from 'volt'/.test(src))
    problems.push(`${name}: stories must import components from 'volt'`);
  if (/projects\/volt\/src\/lib|from '\.\.\/\.\.\/projects\//.test(src)) {
    problems.push(`${name}: import through the public 'volt' surface, not library internals`);
  }
}

for (const file of readdirSync(STORIES).filter(f => f.endsWith('.stories.ts'))) {
  if (!components.includes(file.replace('.stories.ts', ''))) {
    problems.push(`${file}: no public component with this name`);
  }
}

for (const page of FOUNDATIONS) {
  if (!existsSync(join(ROOT, 'stories/foundations', `${page}.mdx`))) {
    problems.push(`foundations: missing stories/foundations/${page}.mdx`);
  }
}

if (problems.length) {
  console.error('[check-storybook]\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
console.log(`[check-storybook] ${components.length} public components have stories`);
