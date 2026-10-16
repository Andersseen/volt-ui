#!/usr/bin/env node
/**
 * Fails if a generated file that is committed to git no longer matches what its generator would
 * write. Run in CI before the build, because the build's own hooks rewrite some of these files
 * and would otherwise paper over a forgotten commit.
 *
 *   site-stats.ts          library version, component/layout/preset counts   (pnpm stats)
 *   api-reference.generated.ts   every component's inputs, outputs, variants  (pnpm generate:api-reference)
 *   mcp/content.generated.ts   installer content served by /api/mcp/setup     (pnpm generate:mcp-content)
 *
 * `etyma.generated.ts` is not here: Etyma owns it and refreshes it from Glossa at dev/build time.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECKS = [
  ['scripts/generate-site-stats.mjs', 'pnpm stats'],
  ['scripts/generate-api-reference.mjs', 'pnpm generate:api-reference'],
  ['scripts/generate-mcp-content.mjs', 'pnpm generate:mcp-content'],
];

let failed = false;
for (const [script, fix] of CHECKS) {
  const run = spawnSync('node', [join(ROOT, script), '--check'], { cwd: ROOT, stdio: 'inherit' });
  if (run.status !== 0) {
    failed = true;
    console.error(`  → fix: ${fix}`);
  }
}
process.exit(failed ? 1 : 0);
