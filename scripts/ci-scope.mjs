#!/usr/bin/env node
/**
 * Which parts of CI a pull request needs, from the files it changes. Pushes to main, the weekly run
 * and manual runs always run everything.
 *
 *   recipes   apps/recipes, its e2e and config                  → Recipes build, SSR, e2e
 *   web       apps/web (voltui.dev), the docs e2e and config     → docs build, SSR, e2e
 *   docs      Markdown at the root, specs/, docs/                → nothing beyond lint and unit
 *   core      everything else — the library, packages/shared, the CLI, scripts, Storybook,
 *             contracts, dependencies, workflows                 → everything (both apps use it)
 *
 * A file that matches no rule is `core`: an unknown path never skips a check.
 * Lint/typecheck/generated files and the unit tests always run.
 *
 *   node scripts/ci-scope.mjs            in CI: reads EVENT and BASE, writes $GITHUB_OUTPUT
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const RULES = [
  ['recipes', /^(apps\/recipes\/|e2e\/recipes\/|playwright\.recipes\.config\.ts$|docs\/recipes-app\.md$)/],
  [
    'web',
    /^(apps\/web\/|e2e\/[^/]+\.spec\.ts$|playwright\.config\.ts$|docs\/doqs-docs\.md$)/,
  ],
  ['docs', /^(specs\/|docs\/|[^/]+\.md$)/],
];

/** @param {string[]} files @returns {{ core: boolean, web: boolean, recipes: boolean }} */
export function scope(files) {
  const hit = { core: false, web: false, recipes: false };
  for (const file of files) {
    const rule = RULES.find(([, re]) => re.test(file));
    if (!rule) hit.core = true;
    else if (rule[0] !== 'docs') hit[rule[0]] = true;
  }
  return { core: hit.core, web: hit.core || hit.web, recipes: hit.core || hit.recipes };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = process.env.EVENT;
  let result;
  if (event !== 'pull_request' || !process.env.BASE) {
    result = { core: true, web: true, recipes: true };
    console.log(`${event}: running every job`);
  } else {
    const files = execFileSync('git', ['diff', '--name-only', `${process.env.BASE}...HEAD`], {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean);
    result = scope(files);
    console.log(`${files.length} changed file(s):\n  ${files.join('\n  ')}`);
  }
  console.log(`scope: ${JSON.stringify(result)}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      Object.entries(result)
        .map(([key, value]) => `${key}=${value}\n`)
        .join('')
    );
  }
}
