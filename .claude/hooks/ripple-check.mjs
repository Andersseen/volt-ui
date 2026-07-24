#!/usr/bin/env node
/**
 * PostToolUse hook — enforces GUARDRAILS.md "Required ripple effects".
 *
 * Fires after an Edit/Write under projects/volt/src/lib/{components,layouts}/<name>/
 * and reports which of the required follow-up edits are still missing. Silent when
 * everything is in place, so it only ever speaks up when there is real work left.
 *
 * Never blocks: it returns additionalContext, not a deny.
 */
'use strict';

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const read = rel => {
  try {
    return readFileSync(join(ROOT, rel), 'utf-8');
  } catch {
    return '';
  }
};

function main(input) {
  const filePath = input?.tool_input?.file_path;
  if (typeof filePath !== 'string') return;

  const match = filePath.match(/projects\/volt\/src\/lib\/(components|layouts)\/([a-z0-9-]+)\//);
  if (!match) return;

  const [, kind, name] = match;
  const constName = name.toUpperCase().replace(/-/g, '_');
  const missing = [];

  // 1. public-api.ts export
  if (!read('projects/volt/src/public-api.ts').includes(`./lib/${kind}/${name}'`)) {
    missing.push(
      `\`projects/volt/src/public-api.ts\` — add \`export * from './lib/${kind}/${name}';\``
    );
  }

  // 2-4. Snippets + demo page only apply to components (layouts have no docs page).
  if (kind === 'components') {
    if (!read('src/app/lib/snippets/index.ts').includes(`components/${name}/`)) {
      missing.push(
        `\`src/app/lib/snippets/index.ts\` — add the \`?raw\` import + \`${constName}_SNIPPET\` export`
      );
    }
    if (!read('src/app/lib/snippets/usage.ts').includes(`${constName}_USAGE`)) {
      missing.push(`\`src/app/lib/snippets/usage.ts\` — add \`${constName}_USAGE\``);
    }
    if (
      !existsSync(join(ROOT, `src/app/pages/(components-docs)/docs/components/${name}.page.ts`))
    ) {
      missing.push(
        `\`src/app/pages/(components-docs)/docs/components/${name}.page.ts\` — demo page (needs \`export default\`)`
      );
    }
  }

  // 5. Generated manifest
  let manifest;
  try {
    manifest = JSON.parse(read('public/manifest.json'));
  } catch {
    manifest = null;
  }
  if (manifest && !Object.prototype.hasOwnProperty.call(manifest.components ?? {}, name)) {
    missing.push('`pnpm manifest` — regenerate `public/manifest.json` (the CLI reads it)');
  }

  if (missing.length === 0) return;

  const context = [
    `Ripple effects still missing for \`${name}\` (see specs/GUARDRAILS.md):`,
    ...missing.map((line, i) => `${i + 1}. ${line}`),
    '',
    'Also check `COMPONENT_STATUS.md` if the stability or test coverage changed.',
    'Skipping these breaks CI or the `volt add` CLI.',
  ].join('\n');

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: context },
    })
  );
}

let raw = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => (raw += chunk));
process.stdin.on('end', () => {
  try {
    main(JSON.parse(raw));
  } catch {
    // A hook must never break the session.
  }
  process.exit(0);
});
