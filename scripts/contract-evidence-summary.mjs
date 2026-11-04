#!/usr/bin/env node
/**
 * Turns the Playwright JSON results written in evidence mode (`EVIDENCE_DIR`, see
 * e2e/utils/evidence.ts) into a human-readable summary: run metadata, per-suite totals per browser,
 * the nine dual-backend families × evidence dimensions, and the Tier 1 catalog.
 *
 *   node scripts/contract-evidence-summary.mjs <evidence-dir> [--out summary.md]
 *
 * A cell is derived from the tests that assert that family on that dimension (the table below
 * names them by title; open the test to see the assertion). Nothing is inferred:
 *
 *   PASS                   every matching test that ran passed (in every browser and mode it ran in)
 *   FAIL                   at least one matching test failed, or passed only on a retry (flaky)
 *   DOCUMENTED DIFFERENCE  passed, and the cell includes an intended backend difference that the
 *                          tests assert explicitly (docs/headless-backends.md "Known differences")
 *   BLOCKED                every matching test was skipped (environment, e.g. WebKit Tab to buttons)
 *   NOT TESTED             no matching test was in the results
 *   N/A                    the dimension is not part of the family's contract
 *
 * The script fails (exit 1) only when the input is unusable; test failures are reported, not hidden,
 * and are the job's own exit status.
 */
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, ...rest] = process.argv.slice(2);
if (!dir || !existsSync(dir)) {
  console.error('usage: contract-evidence-summary.mjs <evidence-dir> [--out file.md]');
  process.exit(1);
}
const outIndex = rest.indexOf('--out');
const outFile = outIndex >= 0 ? rest[outIndex + 1] : null;

/** Every test of every suite in the directory: { suite, file, describe, title, project, status }. */
function collect() {
  const tests = [];
  for (const suite of readdirSync(dir)) {
    const results = join(dir, suite, 'results.json');
    if (!existsSync(results)) continue;
    const report = JSON.parse(readFileSync(results, 'utf8'));
    const walk = (node, trail) => {
      const here = node.title && !/\.ts$/.test(node.title) ? [...trail, node.title] : trail;
      for (const spec of node.specs ?? []) {
        for (const t of spec.tests ?? []) {
          tests.push({
            suite,
            file: spec.file,
            describe: here.join(' › '),
            title: spec.title,
            project: t.projectName,
            // expected | unexpected | flaky | skipped
            status: t.status,
          });
        }
      }
      for (const child of node.suites ?? []) walk(child, here);
    };
    for (const s of report.suites ?? []) walk(s, []);
  }
  return tests;
}

const tests = collect();
if (!tests.length) {
  console.error(`no results.json under ${dir}: nothing ran, or EVIDENCE_DIR was not set`);
  process.exit(1);
}

const installs = [
  ...new Map(
    readdirSync(dir)
      .map(s => join(dir, s, 'install.json'))
      .filter(existsSync)
      .map(p => JSON.parse(readFileSync(p, 'utf8')))
      .map(i => [JSON.stringify({ ...i, sizes: undefined }), i])
  ).values(),
];

// ---------------------------------------------------------------------------------------------
// The nine dual-backend families. Title patterns match e2e/quartz-consumer/*.spec.ts.
// `dd`: the cell includes an intended difference that the matching tests assert explicitly.
// ---------------------------------------------------------------------------------------------
const DIMENSIONS = [
  'Rendering',
  'Pointer',
  'Keyboard',
  'Accessibility',
  'Value / model',
  'Forms',
  'SSR / hydration',
  'Styling',
];
const SSR = /server HTML is prerendered|server ids equal client ids/;
const AXE = /^axe:|focus is always visible/;
const PAINT = /paints and measures the same|paints the same in dark mode/;
const STATE = /programmatic writes reach the DOM|reset restores/;
const FORMS_COMMON = /reset restores|validation: touched/;

const FAMILIES = {
  Checkbox: {
    Rendering: /server HTML is prerendered|mixed resolves/,
    Pointer: /native label, pointer and keyboard|mixed resolves|programmatic writes/,
    Keyboard: /focus ring shows for keyboard focus only|focus is always visible/,
    Accessibility: new RegExp(`${AXE.source}|disabled controls ignore input`),
    'Value / model': new RegExp(`mixed resolves|${STATE.source}`),
    Forms: new RegExp(`native label, pointer and keyboard|${FORMS_COMMON.source}|template-driven`),
    'SSR / hydration': SSR,
    Styling: PAINT,
  },
  Switch: {
    Rendering: /server HTML is prerendered/,
    Pointer: /programmatic writes reach the DOM|focus ring shows/,
    Keyboard: /native label, pointer and keyboard|focus ring shows for keyboard focus only/,
    Accessibility: new RegExp(`${AXE.source}|disabled controls ignore input`),
    'Value / model': STATE,
    Forms: new RegExp(
      `native label, pointer and keyboard|blur marks the control touched|${FORMS_COMMON.source}`
    ),
    'SSR / hydration': SSR,
    Styling: PAINT,
  },
  Toggle: {
    Rendering: /server HTML is prerendered/,
    Pointer: /programmatic writes reach the DOM/,
    Keyboard: /native label, pointer and keyboard/,
    Accessibility: { re: new RegExp(`${AXE.source}|disabled controls ignore input`), dd: true },
    'Value / model': STATE,
    Forms: new RegExp(`native label, pointer and keyboard|${FORMS_COMMON.source}`),
    'SSR / hydration': SSR,
    Styling: PAINT,
  },
  Radio: {
    Rendering: /radio group: prerendered/,
    Pointer: /radio group: prerendered|programmatic writes|template-driven/,
    Keyboard: { re: /radio group: prerendered|RTL: horizontal arrows/, dd: true },
    Accessibility: { re: new RegExp(`${AXE.source}|group items: disabled`), dd: true },
    'Value / model': STATE,
    Forms: new RegExp(`radio group: prerendered|${FORMS_COMMON.source}|template-driven`),
    'SSR / hydration': new RegExp(`radio group: prerendered|${SSR.source}`),
    Styling: PAINT,
  },
  ToggleGroup: {
    Rendering: new RegExp(`toggle groups: multiple keeps order|${SSR.source}`),
    Pointer: /toggle groups: multiple keeps order|programmatic writes/,
    Keyboard: { re: /toggle groups: multiple keeps order|RTL: horizontal arrows/, dd: true },
    Accessibility: { re: new RegExp(`${AXE.source}|group items: disabled`), dd: true },
    'Value / model': new RegExp(`toggle groups: multiple keeps order|${STATE.source}`),
    Forms: new RegExp(`toggle groups: multiple keeps order|${FORMS_COMMON.source}`),
    'SSR / hydration': SSR,
    Styling: PAINT,
  },
  Tabs: {
    Rendering: /tabs: roles and relationships are prerendered/,
    Pointer: /tabs: with activateOnFocus off|programmatic writes|repeated interaction cycles/,
    Keyboard: {
      re: /tabs: roles and relationships|tabs: with activateOnFocus off|tabs: RTL/,
      dd: true,
    },
    Accessibility: { re: new RegExp(`${AXE.source}|tabs: roles and relationships`), dd: true },
    'Value / model': /tabs: roles and relationships|programmatic writes reach the DOM/,
    Forms: null,
    'SSR / hydration': new RegExp(`tabs: roles and relationships are prerendered|${SSR.source}`),
    Styling: PAINT,
  },
  Accordion: {
    Rendering: /accordion: toggles by pointer and keyboard/,
    Pointer: /accordion: toggles|accordion: multiple|repeated interaction cycles/,
    Keyboard: { re: /accordion: toggles by pointer and keyboard/, dd: true },
    Accessibility: {
      re: new RegExp(`${AXE.source}|accordion: toggles by pointer and keyboard`),
      dd: true,
    },
    'Value / model': /accordion: toggles|accordion: multiple|programmatic writes reach the DOM/,
    Forms: null,
    'SSR / hydration': SSR,
    Styling: PAINT,
  },
  Listbox: {
    Rendering: /listbox: prerendered selection/,
    Pointer: /listbox: prerendered selection|programmatic writes/,
    Keyboard: /listbox: prerendered selection/,
    Accessibility: {
      re: new RegExp(`${AXE.source}|listbox: every aria-activedescendant`),
      dd: true,
    },
    'Value / model': new RegExp(`listbox: prerendered selection|${STATE.source}`),
    Forms: new RegExp(`listbox: prerendered selection|${FORMS_COMMON.source}`),
    'SSR / hydration': new RegExp(`listbox: prerendered selection|${SSR.source}`),
    Styling: PAINT,
  },
  Select: {
    Rendering: /select: opens under the trigger/,
    Pointer:
      /select: opens under the trigger|select: multiple keeps the popup open|programmatic writes/,
    Keyboard: { re: /select: keyboard opens/, dd: true },
    Accessibility: { re: new RegExp(`${AXE.source}|select: opens under the trigger`), dd: true },
    'Value / model': {
      re: new RegExp(`select: multiple keeps|${STATE.source}|repeated interaction cycles`),
      dd: true,
    },
    Forms: new RegExp(`${FORMS_COMMON.source}|template-driven|programmatic writes`),
    'SSR / hydration': SSR,
    Styling: { re: PAINT, dd: true },
  },
};

const QUARTZ = tests.filter(t => t.suite.startsWith('quartz-consumer'));
const PACKAGE_MODES = ['ng-primitives consumer', 'quartz consumer'];
const COPY_MODES = ['ng-primitives (CLI copy) consumer', 'quartz (CLI copy) consumer'];
const modeOf = t =>
  [...COPY_MODES, ...PACKAGE_MODES].find(m => t.describe.startsWith(m)) ??
  (/every backend|in dark mode/.test(t.title) ? 'cross-backend' : 'other');

function verdict(matching, dd = false) {
  if (!matching.length) return 'NOT TESTED';
  if (matching.some(t => t.status === 'unexpected' || t.status === 'flaky')) return 'FAIL';
  const ran = matching.filter(t => t.status !== 'skipped');
  if (!ran.length) return 'BLOCKED';
  return dd ? 'DOCUMENTED DIFFERENCE' : 'PASS';
}

function familyRow(name, cells) {
  const row = [name];
  const familyTests = [];
  for (const dim of DIMENSIONS) {
    const cell = cells[dim];
    if (cell === null) {
      row.push('N/A');
      continue;
    }
    const { re, dd } = cell instanceof RegExp ? { re: cell, dd: false } : cell;
    const matching = QUARTZ.filter(t => re.test(t.title));
    familyTests.push(...matching);
    row.push(verdict(matching, dd));
  }
  const unique = [...new Set(familyTests)];
  for (const modes of [PACKAGE_MODES, COPY_MODES]) {
    row.push(verdict(unique.filter(t => modes.includes(modeOf(t)))));
  }
  return row;
}

// ---------------------------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------------------------
const icon = s =>
  ({
    PASS: '✅ PASS',
    FAIL: '❌ FAIL',
    'DOCUMENTED DIFFERENCE': '🔶 DOCUMENTED DIFFERENCE',
    BLOCKED: '⛔ BLOCKED',
    'NOT TESTED': '⬜ NOT TESTED',
    'N/A': 'N/A',
  })[s] ?? s;

const count = (list, status) => list.filter(t => t.status === status).length;
const suites = [...new Set(tests.map(t => t.suite))].sort();
const lines = [];
const env = process.env;
lines.push('# Volt UI — contract evidence');
lines.push('');
lines.push('| | |');
lines.push('| --- | --- |');
lines.push(`| Commit | \`${env.EVIDENCE_SHA ?? env.GITHUB_SHA ?? 'local'}\` |`);
lines.push(`| Ref | \`${env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || 'local'}\` |`);
if (env.GITHUB_RUN_ID) {
  lines.push(
    `| Run | ${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID} (attempt ${env.GITHUB_RUN_ATTEMPT ?? 1}) |`
  );
}
lines.push(`| Date (UTC) | ${new Date().toISOString()} |`);
lines.push(`| Node | ${process.version} |`);
if (env.EVIDENCE_VOLT_VERSION)
  lines.push(`| @voltui/components (source) | ${env.EVIDENCE_VOLT_VERSION} |`);
for (const i of installs) {
  lines.push(
    `| Quartz consumer, Angular ${i.requestedAngular} | Angular ${i.angular} · @voltui/components ${i.voltComponents} (packed tarball) · @quartz-headless/primitives ${i.quartzPrimitives} (npm) · ng-primitives ${i.ngPrimitives} · strict peers **${i.strictPeerResolution}** (${i.installedWith}) · isolation **${i.isolation === 'PASS' ? 'PASS' : 'FAIL'}** |`
  );
}
lines.push(`| Browsers | ${[...new Set(tests.map(t => t.project))].sort().join(', ')} |`);
lines.push('');
lines.push('## Totals per suite and browser');
lines.push('');
lines.push('| suite | browser | passed | failed | flaky | skipped |');
lines.push('| --- | --- | ---: | ---: | ---: | ---: |');
for (const suite of suites) {
  const inSuite = tests.filter(t => t.suite === suite);
  for (const project of [...new Set(inSuite.map(t => t.project))].sort()) {
    const l = inSuite.filter(t => t.project === project);
    lines.push(
      `| ${suite} | ${project} | ${count(l, 'expected')} | ${count(l, 'unexpected')} | ${count(l, 'flaky')} | ${count(l, 'skipped')} |`
    );
  }
}
const failed = tests.filter(t => t.status === 'unexpected' || t.status === 'flaky');
lines.push('');
if (failed.length) {
  lines.push(`## Failed or flaky (${failed.length})`);
  lines.push('');
  for (const t of failed.slice(0, 60))
    lines.push(`- **${t.status}** · ${t.suite} · ${t.project} · ${t.describe} › ${t.title}`);
  lines.push('');
}
const skipped = tests.filter(t => t.status === 'skipped');
if (skipped.length) {
  lines.push(`<details><summary>Skipped (${skipped.length}) — never counted as passed</summary>\n`);
  const grouped = new Map();
  for (const t of skipped) {
    const key = `${t.project} · ${t.title}`;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  for (const [k, n] of grouped) lines.push(`- ${k}${n > 1 ? ` (×${n})` : ''}`);
  lines.push('\n</details>\n');
}

if (QUARTZ.length) {
  lines.push('## The nine dual-backend families');
  lines.push('');
  lines.push(
    'Aggregated over every browser and every consumer mode that ran (ng-primitives and Quartz, package and CLI copy). ' +
      '🔶 = verified, and includes an intended difference asserted by the tests (docs/headless-backends.md). ' +
      'Manual screen-reader testing is **not** part of this evidence (docs/quality/manual-a11y-checklist.md).'
  );
  lines.push('');
  const header = ['family', ...DIMENSIONS, 'Package mode', 'CLI copy mode'];
  lines.push(`| ${header.join(' | ')} |`);
  lines.push(`| ${header.map(() => '---').join(' | ')} |`);
  for (const [name, cells] of Object.entries(FAMILIES)) {
    lines.push(
      `| ${familyRow(name, cells)
        .map((c, i) => (i ? icon(c) : `**${c}**`))
        .join(' | ')} |`
    );
  }
  lines.push('');
}

const catalog = tests.filter(t => /catalog\.spec\.ts$/.test(t.file));
if (catalog.length) {
  lines.push('## Tier 1 catalog smoke (default backend, packed package)');
  lines.push('');
  lines.push(
    '| family check | ' + [...new Set(catalog.map(t => t.project))].sort().join(' | ') + ' |'
  );
  const projects = [...new Set(catalog.map(t => t.project))].sort();
  lines.push(`| --- | ${projects.map(() => '---').join(' | ')} |`);
  for (const title of [...new Set(catalog.map(t => t.title))]) {
    const cells = projects.map(p => {
      // Every suite that ran it in this browser (default contracts and each Angular compat build).
      return icon(verdict(catalog.filter(c => c.title === title && c.project === p)));
    });
    lines.push(`| ${title} | ${cells.join(' | ')} |`);
  }
  lines.push('');
}

lines.push('## Artifacts');
lines.push('');
lines.push(
  'Each suite uploads `html/` (open `index.html`: every test, its steps, attached axe results, ' +
    'measurements and screenshots; traces for failures), `results.json`, `junit.xml` and, for the ' +
    'Quartz consumer, `install.json` (versions, peer resolution, isolation, bundle sizes).'
);

const md = lines.join('\n') + '\n';
if (outFile) writeFileSync(outFile, md);
if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, md);
if (!outFile && !env.GITHUB_STEP_SUMMARY) process.stdout.write(md);
console.error(
  `[contract-evidence] ${tests.length} results · ${count(tests, 'expected')} passed · ${failed.length} failed/flaky · ${skipped.length} skipped`
);
