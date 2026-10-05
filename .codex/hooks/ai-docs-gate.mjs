#!/usr/bin/env node
/**
 * Stop hook — gate on AI-docs catalog drift.
 *
 * The component catalog is hand-mirrored across the MCP server, the installed skill,
 * the prompt reference and the Cursor/Copilot payloads (see AGENTS.md "AI tools for
 * consumers"). `cli/check-ai-docs-sync.js` detects drift; today it only runs inside
 * `pnpm test:all`. This runs it once at the end of a session (~0.3s) so drift is caught
 * before the commit rather than in CI.
 *
 * Regenerates public/manifest.json as a side effect — same as `pnpm manifest`.
 */
'use strict';

import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

function run(script) {
  return spawnSync(process.execPath, [join(ROOT, 'cli', script)], {
    cwd: ROOT,
    encoding: 'utf-8',
  });
}

function main(input) {
  // Guard against the block -> stop -> block loop.
  if (input?.stop_hook_active) return;

  const manifest = run('generate-manifest.js');
  if (manifest.status !== 0) return; // Can't verify; stay out of the way.

  const check = run('check-ai-docs-sync.js');
  if (check.status === 0) return;

  const detail = `${check.stdout ?? ''}${check.stderr ?? ''}`.trim();
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: [
        'AI docs catalog drift detected (`pnpm check:ai-docs` fails). CI will fail on this.',
        '',
        detail,
        '',
        'Sync the component list across the files listed in AGENTS.md "AI tools for consumers":',
        '- `.agents/skills/volt-ui/SKILL.md`',
        '- `cli/mcp/setup-mcp.js` (VOLT_UI_SKILL, CURSOR_RULES, COPILOT_INSTRUCTIONS, VSCODE_SNIPPETS)',
        '- `src/server/routes/mcp.ts` and `src/server/routes/mcp/setup.ts`',
        '- `VOLT_UI_PROMPT.md`',
        '- `src/app/lib/snippets/usage.ts`',
      ].join('\n'),
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
