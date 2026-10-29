#!/usr/bin/env node

/**
 * Fails when the content AI tools read states something the library does not.
 *
 * Sources checked: the agent skills (cli/agent/skills), the single-file prompt (VOLT_UI_PROMPT.md),
 * the MCP server (apps/web/src/server/routes/mcp.ts), the installer content (cli/agent/content.js) and the
 * agent README. They are compared with the library itself — its selectors, its public exports, its
 * peer dependencies — and with COMPONENT_STATUS.md, never with each other.
 *
 *   inventory   every component in the manifest is served by the MCP server and described in the
 *               generated responsibilities; the MCP server serves nothing the manifest lacks
 *   skills      the skill set is the expected single-responsibility set, each with a matching
 *               name, a description and a digest; the router stays short
 *   selectors   every element and attribute directive written in a template exists
 *   imports     every name imported from '@voltui/components' (or './ui/<x>') is really exported
 *   classes     every class named Volt-something or Ui-something that is mentioned exists
 *   status      a component is never called stable/beta/experimental against COMPONENT_STATUS.md
 *   angular     no hard-coded Angular major: the supported range is the library's peer dependency
 *   removed     elements and APIs that do not exist (and are easy to hallucinate) are not mentioned
 *
 * Ground truth for the component list is apps/web/public/manifest.json (`pnpm manifest`).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf-8');
const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

/** Text between generated markers is derived from the library; only hand-written prose is checked. */
const stripGenerated = text =>
  text
    .replace(/<!-- volt:catalog:start -->[\s\S]*?<!-- volt:catalog:end -->/g, '')
    .replace(/<!-- volt:digest:start -->[\s\S]*?<!-- volt:digest:end -->/g, m => m);

function skillFiles() {
  const dir = path.join(ROOT, 'cli/agent/skills');
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => ({ name: d.name, file: `cli/agent/skills/${d.name}/SKILL.md` }));
}

async function main() {
  const { librarySelectors, templateNames, publicExports } = await import(
    pathToFileURL(path.join(ROOT, 'scripts/lib/selectors.mjs')).href
  );
  const { loadCatalog } = await import(
    pathToFileURL(path.join(ROOT, 'scripts/lib/component-catalog.mjs')).href
  );

  const manifestPath = path.join(ROOT, 'apps/web/public/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Missing apps/web/public/manifest.json — run "pnpm manifest" first.');
    process.exit(1);
  }
  const manifest = new Set(
    Object.keys(JSON.parse(fs.readFileSync(manifestPath, 'utf-8')).components)
  );

  // --- inventory ---------------------------------------------------------------------------
  const mcpSrc = read('apps/web/src/server/routes/mcp.ts');
  const block = mcpSrc.slice(
    mcpSrc.indexOf('const components: Record<string, ComponentMeta> = {'),
    mcpSrc.indexOf('\nconst componentKeys')
  );
  const mcpKeys = new Set(
    [...block.matchAll(/^ {2}(?:'([a-z0-9-]+)'|([a-z][a-zA-Z0-9-]*)):\s*\{/gm)].map(
      m => m[1] ?? m[2]
    )
  );
  const catalog = await loadCatalog();
  const described = new Set(catalog.map(c => c.key));
  for (const key of manifest) {
    if (!mcpKeys.has(key))
      fail('apps/web/src/server/routes/mcp.ts', `serves no component "${key}"`);
    if (!described.has(key))
      fail('component metadata', `"${key}" has no responsibility (Storybook guide)`);
  }
  for (const key of mcpKeys) {
    if (!manifest.has(key))
      fail(
        'apps/web/src/server/routes/mcp.ts',
        `serves "${key}", which the manifest does not know`
      );
  }

  // --- skills ------------------------------------------------------------------------------
  const EXPECTED = [
    'volt-ui',
    'volt-ui-adoption',
    'volt-ui-component-selection',
    'volt-ui-distribution',
    'volt-ui-forms',
    'volt-ui-overlays',
    'volt-ui-styling',
  ];
  const skills = skillFiles();
  const names = skills.map(s => s.name).sort();
  if (JSON.stringify(names) !== JSON.stringify([...EXPECTED].sort())) {
    fail(
      'cli/agent/skills',
      `skill set is ${names.join(', ')}; expected ${EXPECTED.join(', ')} (add a skill only for a genuinely independent workflow, and update this list)`
    );
  }
  for (const { name, file } of skills) {
    const text = read(file);
    const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    if (front.match(/^name:\s*(.+)$/m)?.[1]?.trim() !== name)
      fail(file, 'frontmatter name must equal the directory name');
    if (!/^description:\s*>?\s*\n?\s*\S/m.test(front))
      fail(file, 'needs a description saying when to use it');
    if (!/<!-- volt:digest:start -->[\s\S]+?<!-- volt:digest:end -->/.test(text))
      fail(file, 'needs a digest section (rules-file agents get only that)');
    const lines = stripGenerated(text).split('\n').length;
    if (name === 'volt-ui' && lines > 60)
      fail(file, `the router skill is ${lines} lines; it routes, it does not carry the playbooks`);
    if (lines > 140) fail(file, `${lines} lines: split by responsibility instead`);
    if (/\|\s*Key inputs\s*\|/i.test(text))
      fail(file, 'an inputs table is an API copy; exact APIs come from the MCP server');
  }

  // --- the hand-written prose that makes factual claims ---------------------------------------
  const files = [
    ...skills.map(s => s.file),
    'VOLT_UI_PROMPT.md',
    'apps/web/src/server/routes/mcp.ts',
    'cli/agent/content.js',
    'cli/agent/README.md',
  ];
  const sel = librarySelectors();
  const { elements, attributes } = templateNames(sel);
  const exported = publicExports();
  const toPackage = n => n.replace(/^Ui(?=[A-Z])/, 'Volt');
  const titles = new Map(catalog.map(c => [c.title, c]));
  const peer = JSON.parse(read('packages/volt/package.json')).peerDependencies['@angular/core'];
  const majors = new Set([...peer.matchAll(/(\d+)\.\d+\.\d+/g)].map(m => m[1]));

  const REMOVED = [
    [
      /\bui-native-select\b|\bvolt-native-select\b/,
      'there is no native-select element: it is `select[voltNativeSelect]`',
    ],
    [
      /\bui-file-upload\b|\bvolt-file-upload\b/,
      'file upload is the `[voltFileUpload]` directive and `volt-file-dropzone`, not an element',
    ],
    [/from\s+'volt'/, "'volt' is only the monorepo's path alias; a consumer never imports it"],
    [/\bcustomClass\b(?![^.\n]*deprecated)/, '`customClass` is removed; use `class`'],
  ];

  for (const file of files) {
    // A line that says "never write <ui-dialog>" mentions a name in order to forbid it.
    const NEGATION = /\b(never|not|no|don't|do not|isn't|cannot|without)\b/i;
    const code = stripGenerated(read(file))
      .split('\n')
      .map(line => (NEGATION.test(line) ? '' : line))
      .join('\n');

    for (const [pattern, why] of REMOVED) {
      if (pattern.test(code)) fail(file, why);
    }

    for (const m of code.matchAll(/<((?:volt|ui)-[a-z][a-z0-9-]*)/g)) {
      const el = m[1].replace(/^ui-/, 'volt-');
      if (!elements.has(el)) fail(file, `<${m[1]}> is not an element the library declares`);
    }
    for (const tag of code.matchAll(/<[a-z][^<>\n]*>/g)) {
      for (const a of tag[0].matchAll(/[\s\[(]((?:volt|ui)[A-Z]\w*)/g)) {
        const attr = a[1].replace(/^ui/, 'volt');
        if (!attributes.has(attr))
          fail(file, `\`${a[1]}\` is not a directive the library declares`);
      }
    }

    for (const m of code.matchAll(
      /import\s*\{([^}]*)\}\s*from\s*'(@voltui\/components|\.\/ui\/([a-z-]+))'/g
    )) {
      if (m[3] && m[3] !== 'x' && !manifest.has(m[3]))
        fail(file, `imports from ./ui/${m[3]}, which is not a component`);
      for (const n of m[1]
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)) {
        const name = n.split(/\s+as\s+/)[0];
        if (['VoltX', 'UiX', '…'].includes(name)) continue;
        if (!exported.has(toPackage(name)))
          fail(file, `imports ${name}, which the library does not export`);
        if (m[2] === '@voltui/components' && /^Ui[A-Z]/.test(name))
          fail(file, `${name} is a copy-mode name; the package exports ${toPackage(name)}`);
      }
    }

    for (const m of code.matchAll(/\b(Volt|Ui)([A-Z][A-Za-z0-9]+)\b/g)) {
      if (['VoltUI', 'UiKit', 'VoltX', 'UiX', 'VoltXxx', 'UiXxx'].includes(m[0])) continue;
      if (!exported.has(toPackage(m[0])))
        fail(file, `mentions ${m[0]}, which the library does not export`);
    }

    for (const [title, c] of titles) {
      const re = new RegExp(`\\b${title}\\b[^.\\n|]{0,40}?\\b(stable|beta|experimental)\\b`, 'gi');
      for (const m of code.matchAll(re)) {
        if (m[1].toLowerCase() !== c.status) {
          fail(file, `calls ${title} ${m[1].toLowerCase()}; COMPONENT_STATUS.md says ${c.status}`);
        }
      }
    }

    for (const m of code.matchAll(/\bAngular\s+v?(\d{2})\b/g)) {
      fail(
        file,
        `hard-codes "${m[0]}"; the supported range is the peer dependency (${peer}), served by get_project_info`
      );
    }
    void majors;
  }
}

main().then(
  () => {
    if (problems.length) {
      console.error('AI content drift detected:\n  - ' + [...new Set(problems)].join('\n  - '));
      console.error(
        '\nFix the source of the claim (see AGENTS.md "AI tools for consumers"), not this check.'
      );
      process.exit(1);
    }
    console.log(
      'AI content is consistent with the library (inventory, skills, selectors, imports, status, Angular).'
    );
  },
  error => {
    console.error(error);
    process.exit(1);
  }
);
