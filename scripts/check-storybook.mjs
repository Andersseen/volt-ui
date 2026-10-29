#!/usr/bin/env node
/**
 * Storybook coverage guard: adding a public component without a Storybook representation fails here.
 *
 * For every component or layout exported from `packages/volt/src/public-api.ts` (minus `theme`,
 * which is documented under Foundations) it requires:
 *
 *   - `stories/components/<name>.stories.ts` with at least one story export,
 *   - a literal CSF `title` of `Components/<group>/<title>` that matches the guide data,
 *   - imports through the public `volt` surface, never `packages/volt/src/lib/...`,
 *   - the generated docs page (checked separately by `generate-storybook-docs.mjs --check`),
 *
 * and it rejects stories files whose component is not public, and a missing Foundations page.
 *
 * Storybook is where a reviewer sees every public *state*. REQUIRED_STATES lists, for components
 * whose visible state carries meaning, the stories that must exist — a bug in one of those states
 * (a pressed toggle that looked unpressed, a manual combobox with no loading view) is then only
 * "fixed" once the state a reviewer would look at is on screen. It is a short list on purpose: add
 * to it when a bug fix corresponds to a public state, not for internal edge cases.
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

/** Component → story exports that must exist (see the header). */
const REQUIRED_STATES = {
  toggle: ['States'],
  'toggle-group': ['SingleSelection'],
  checkbox: ['States', 'Invalid'],
  switch: ['States', 'Invalid'],
  radio: ['States', 'Invalid'],
  input: ['States'],
  textarea: ['States'],
  select: ['Disabled'],
  combobox: ['Disabled', 'ServerSide', 'ManualLoading', 'ManualResults', 'ManualEmpty'],
  dialog: ['Controlled', 'NotDismissible'],
};

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
  for (const state of REQUIRED_STATES[name] ?? []) {
    if (!new RegExp(`^export const ${state}\\s*:\\s*Story\\b`, 'm').test(src)) {
      problems.push(`${name}: the public state story \`${state}\` is missing`);
    }
  }
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
