#!/usr/bin/env node

/**
 * Fails if the component catalog drifts between the places that hand-maintain
 * it for AI tools: the MCP server, the Claude/OpenCode skill, the prompt
 * reference, and the Cursor/Copilot content shipped by the installer.
 *
 * Ground truth is public/manifest.json, generated from the library source by
 * `pnpm manifest` (cli/generate-manifest.js). Run `pnpm manifest` first if
 * this fails right after adding/renaming a component.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

function manifestKeys() {
  const manifestPath = path.join(ROOT, 'public/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Missing public/manifest.json — run "pnpm manifest" first.');
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  return new Set(Object.keys(manifest.components));
}

function mcpTsKeys() {
  const src = readFile('src/server/routes/mcp.ts');
  const start = src.indexOf('const components: Record<string, ComponentMeta> = {');
  const end = src.indexOf('\nconst componentKeys', start);
  const block = src.slice(start, end);
  const keys = new Set();
  const re = /^ {2}(?:'([a-z0-9-]+)'|([a-z][a-zA-Z0-9-]*)):\s*\{/gm;
  let match;
  while ((match = re.exec(block))) {
    keys.add(match[1] ?? match[2]);
  }
  return keys;
}

function cliImportKeys(src) {
  // Matches `./ui/name` in plain markdown and \`./ui/name\` inside JS template
  // literals (cli/mcp/setup-mcp.js escapes backticks since it embeds this
  // content inside its own template-literal strings).
  const keys = new Set();
  const re = /\\?`\.\/ui\/([a-z0-9-]+)\\?`/g;
  let match;
  while ((match = re.exec(src))) {
    keys.add(match[1]);
  }
  return keys;
}

function skillKeys() {
  return cliImportKeys(readFile('.agents/skills/volt-ui/SKILL.md'));
}

function promptKeys() {
  return cliImportKeys(readFile('VOLT_UI_PROMPT.md'));
}

function installerKeys() {
  const src = readFile('cli/mcp/setup-mcp.js');

  // CURSOR_RULES ships a middot-separated plain list rather than a table.
  const cursorMatch = src.match(/## Components\n([\s\S]*?)\n\n/);
  const cursorKeys = new Set(
    cursorMatch
      ? cursorMatch[1]
          .split(/[\s·\n]+/)
          .map(s => s.trim())
          .filter(Boolean)
      : []
  );

  // COPILOT_INSTRUCTIONS and VOLT_UI_SKILL (inlined) both use the `./ui/<name>` table format.
  const tableKeys = cliImportKeys(src);

  return new Set([...cursorKeys, ...tableKeys]);
}

const sources = {
  'src/server/routes/mcp.ts': mcpTsKeys,
  '.agents/skills/volt-ui/SKILL.md': skillKeys,
  'VOLT_UI_PROMPT.md': promptKeys,
  'cli/mcp/setup-mcp.js': installerKeys,
};

const truth = manifestKeys();
let hasDrift = false;

for (const [label, getKeys] of Object.entries(sources)) {
  const keys = getKeys();
  const missing = [...truth].filter(k => !keys.has(k)).sort();
  const extra = [...keys].filter(k => !truth.has(k)).sort();

  if (missing.length || extra.length) {
    hasDrift = true;
    console.error(`\n${label}`);
    if (missing.length) console.error(`  missing: ${missing.join(', ')}`);
    if (extra.length) console.error(`  extra (unknown to manifest): ${extra.join(', ')}`);
  }
}

if (hasDrift) {
  console.error(
    '\nComponent catalog drift detected. Update the file(s) above — see AGENTS.md "AI tools for consumers".'
  );
  process.exit(1);
}

console.log(`AI docs component catalog in sync (${truth.size} components).`);
