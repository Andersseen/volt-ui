#!/usr/bin/env node
/**
 * Writes specs/behavioral-contracts.md: for every public interactive component, which consumer
 * contracts apply and which test proves each.
 *
 * The matrix exists to expose missing behavioural dimensions, not to produce a completeness score.
 * Evidence is matched per component, from that component's own spec files and from the cross-cutting
 * specs and browser contracts that name it — a contract is never credited to a component because a
 * similar one is covered. Matching is by test title, so it is a map to the tests, not a proof: read
 * the tests it points to. A cell shows how many tests it found; `GAP` is an applicable contract with
 * none.
 *
 *   node scripts/generate-behavior-matrix.mjs          write (runs the unit suite and lists the Playwright tests)
 *
 * Not part of check:generated: producing it runs the tests. Regenerate it when tests are added.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'specs/behavioral-contracts.md');

/** Contract → title patterns. Order is the column order. */
const CONTRACTS = {
  'static value': /static|literal|initial value|initial selection|stays interactive/i,
  'dynamic binding': /dynamic|parent update|one-way/i,
  'two-way': /two-way|\[\(|writes .* back|model/i,
  'reactive forms': /reactive|formcontrol|forms contract|form control|value, touched/i,
  'template forms': /ngmodel|template-driven/i,
  'one emission': /\bonce\b|one user action|emits? (the )?(value|date|result)|emission/i,
  'no echo': /programmatic write|not a user change|does not emit|no emission/i,
  disabled: /disabled|ignores interaction|not clickable/i,
  touched: /touched|blur/i,
  invalid: /invalid/i,
  keyboard: /keyboard|arrow|enter\b|space\b|home\b|end\b|tab\b|escape/i,
  pointer: /pointer|click|drag|hover|mouse|press/i,
  'accessible name': /accessible name|named|aria-label|label/i,
  'aria state': /aria|announce|role|expose/i,
  'open/close': /open|close|dismiss|swap/i,
  'focus trap/return':
    /focus (is )?(trap|return)|returns? focus|trapped|stays inside|return(s)? (it )?to/i,
  'outside click': /outside/i,
  geometry: /geometry|portal|position|centred|docks|width|boundary|painted/i,
  'drag/drop/paste': /drop|paste|file chooser|drag/i,
  'visible state': /visibly|visible state|distinct|paints|contrast/i,
};

/** Which contracts apply to which component. Anything not listed is not applicable. */
const A = (...c) => c;
const VALUE = A(
  'static value',
  'dynamic binding',
  'one emission',
  'keyboard',
  'pointer',
  'aria state'
);
// `model()` outputs report a value change from any source (user, parent or forms); only components
// with a dedicated user-driven output are held to 'no echo' (see specs/plans/reliability-dogfood-agent-dx.md).
const USER_OUTPUT = A('no echo');
const CVA = A('reactive forms', 'template forms', 'disabled', 'touched', 'invalid');
const APPLICABLE = {
  accordion: A(...VALUE, ...USER_OUTPUT, 'disabled', 'open/close'),
  button: A('disabled', 'keyboard', 'pointer', 'accessible name', 'aria state'),
  checkbox: A(...VALUE, 'visible state', 'two-way', ...CVA, 'accessible name'),
  combobox: A(
    ...VALUE,
    'two-way',
    ...CVA,
    'accessible name',
    'open/close',
    'outside click',
    'geometry'
  ),
  'date-picker': A(
    'static value',
    'dynamic binding',
    'one emission',
    'keyboard',
    'pointer',
    'visible state',
    'two-way',
    'reactive forms',
    'template forms',
    'disabled',
    'touched',
    'accessible name'
  ),
  dialog: A(
    'open/close',
    'keyboard',
    'focus trap/return',
    'outside click',
    'accessible name',
    'geometry',
    'aria state'
  ),
  drawer: A(
    'open/close',
    'keyboard',
    'focus trap/return',
    'outside click',
    'accessible name',
    'geometry',
    'aria state'
  ),
  'dropdown-menu': A(
    'open/close',
    'keyboard',
    'focus trap/return',
    'outside click',
    'disabled',
    'aria state'
  ),
  'file-upload': A('disabled', 'drag/drop/paste', 'pointer'),
  input: A('two-way', ...CVA, 'accessible name', 'visible state'),
  'input-otp': A('two-way', ...CVA, 'keyboard', 'drag/drop/paste', 'aria state'),
  listbox: A(...VALUE, ...USER_OUTPUT, 'visible state', 'two-way', ...CVA, 'accessible name'),
  'native-select': A('disabled', 'accessible name'),
  'navigation-menu': A('open/close', 'keyboard', 'aria state', 'pointer'),
  pagination: A('one emission', 'disabled', 'keyboard', 'pointer', 'aria state'),
  popover: A(
    'open/close',
    'keyboard',
    'focus trap/return',
    'outside click',
    'geometry',
    'disabled'
  ),
  radio: A(...VALUE, ...USER_OUTPUT, 'visible state', 'two-way', ...CVA, 'accessible name'),
  'range-slider': A(...VALUE, ...USER_OUTPUT, ...CVA, 'geometry'),
  resizable: A('keyboard', 'pointer', 'geometry', 'aria state'),
  search: A('accessible name', 'pointer', 'keyboard'),
  select: A(
    ...VALUE,
    'two-way',
    ...CVA,
    'accessible name',
    'open/close',
    'outside click',
    'geometry'
  ),
  slider: A(...VALUE, ...USER_OUTPUT, ...CVA, 'geometry'),
  switch: A(...VALUE, 'visible state', 'two-way', ...CVA, 'accessible name'),
  tabs: A(...VALUE, ...USER_OUTPUT, 'visible state', 'accessible name'),
  textarea: A('two-way', ...CVA, 'accessible name'),
  toast: A('open/close', 'aria state', 'pointer', 'keyboard'),
  toggle: A(...VALUE, 'visible state', 'two-way', ...CVA, 'accessible name'),
  'toggle-group': A(
    ...VALUE,
    ...USER_OUTPUT,
    'visible state',
    'two-way',
    ...CVA,
    'accessible name'
  ),
  toolbar: A('keyboard', 'aria state', 'accessible name'),
  tooltip: A('open/close', 'keyboard', 'geometry', 'aria state'),
};

/** Words that attribute a test title in a cross-cutting file to a component. */
const ALIASES = {
  accordion: ['accordion', 'acc'],
  checkbox: ['checkbox'],
  combobox: ['combobox'],
  'date-picker': ['date-picker', 'date picker', 'range-picker'],
  dialog: ['dialog'],
  drawer: ['drawer'],
  'dropdown-menu': ['dropdown', 'menu'],
  'file-upload': ['file upload', 'file-upload', 'dropzone'],
  input: ['input'],
  textarea: ['textarea'],
  'native-select': ['native select', 'native-select'],
  search: ['search'],
  'input-otp': ['otp', 'input otp'],
  listbox: ['listbox'],
  'navigation-menu': ['navigation-menu', 'navigation menu'],
  pagination: ['pagination'],
  popover: ['popover'],
  radio: ['radio', 'radio-group'],
  'range-slider': ['range-slider', 'range slider'],
  resizable: ['resizable'],
  select: ['select'],
  slider: ['slider'],
  switch: ['switch'],
  tabs: ['tabs', 'tab'],
  toast: ['toast'],
  toggle: ['toggle'],
  'toggle-group': ['toggle-group', 'toggle group'],
  toolbar: ['toolbar'],
  tooltip: ['tooltip'],
};

/**
 * The real test names: vitest and Playwright are asked to list them, so `it.each` rows are expanded
 * ("checkbox: …", "switch: …") instead of guessed from the source.
 */
function run(command, args) {
  const r = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.stdout;
}

function unitTests() {
  const out = join(tmpdir(), `volt-matrix-${process.pid}.json`);
  spawnSync('pnpm', ['exec', 'vitest', '--run', '--reporter=json', `--outputFile=${out}`], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  const report = JSON.parse(readFileSync(out, 'utf8'));
  rmSync(out, { force: true });
  return report.testResults.flatMap(file =>
    file.assertionResults.map(t => ({
      file: file.name.replace(ROOT + '/', ''),
      title: t.fullName,
    }))
  );
}

function playwrightTests(config, layer) {
  const json = run('pnpm', [
    'exec',
    'playwright',
    'test',
    '-c',
    config,
    '--list',
    '--reporter=json',
  ]);
  const report = JSON.parse(json.slice(json.indexOf('{')));
  const tests = [];
  const walk = (suite, trail) => {
    const here = suite.title && !suite.title.endsWith('.ts') ? [...trail, suite.title] : trail;
    for (const spec of suite.specs ?? []) {
      tests.push({ file: spec.file, layer, title: [...here, spec.title].join(' ') });
    }
    for (const child of suite.suites ?? []) walk(child, here);
  };
  for (const suite of report.suites) walk(suite, []);
  // Each test is listed once per project; one entry is enough.
  return [...new Map(tests.map(t => [`${t.file}|${t.title}`, t])).values()];
}

const unit = unitTests();
const contracts = playwrightTests('playwright.contracts.config.ts', 'browser');
const storybook = playwrightTests('playwright.storybook.config.ts', 'storybook');
const docsE2E = playwrightTests('playwright.config.ts', 'e2e').filter(t =>
  /file-upload|button|consumer\.spec/.test(t.file)
);

const wordIn = (title, word) =>
  new RegExp(`(^|[^a-z-])${word.replace(/[-\s]/g, '[-\\s]')}([^a-z-]|$)`, 'i').test(title);

function evidence(key) {
  const words = ALIASES[key] ?? [key];
  const mentions = list => list.filter(t => words.some(w => wordIn(t.title, w)));
  const ownUnit = unit.filter(
    t =>
      t.file.includes(`/components/${key}/`) ||
      t.file.includes(`/layouts/${key}/`) ||
      t.file.endsWith(`/${key}.spec.ts`)
  );
  const crossCutting = unit.filter(t =>
    /lib\/(behavior-contract|interaction-contract(-\d)?|static-value)\.spec\.ts$/.test(t.file)
  );
  return {
    unit: ownUnit.map(t => t.title),
    contract: mentions(crossCutting).map(t => t.title),
    browser: mentions(contracts).map(t => t.title),
    e2e: mentions(docsE2E).map(t => t.title),
    storybook: mentions(storybook).map(t => t.title),
  };
}

const rows = [];
const gaps = [];
for (const [key, dims] of Object.entries(APPLICABLE)) {
  const ev = evidence(key);
  const all = Object.entries(ev).flatMap(([layer, ts]) => ts.map(t => [layer, t]));
  const cells = Object.keys(CONTRACTS).map(dim => {
    if (!dims.includes(dim)) return '–';
    const hits = all.filter(([, t]) => CONTRACTS[dim].test(t));
    if (!hits.length) {
      gaps.push(`${key}: ${dim}`);
      return 'GAP';
    }
    const layers = [...new Set(hits.map(([l]) => l[0].toUpperCase()))].sort().join('');
    return `${hits.length}${layers}`;
  });
  rows.push(`| ${key} | ${cells.join(' | ')} |`);
}

const header = Object.keys(CONTRACTS);
const md = `# Behavioural contracts

Generated by \`pnpm generate:behavior-matrix\`. Do not edit.

A stable component is verified when its **public consumer contract** is observed through the DOM
and, where browser behaviour matters, in a real browser — not when its lines execute. This matrix
lists, per public interactive component, the contracts that apply (\`–\` = does not apply) and how many
tests were found for each (\`GAP\` = applies, none found).

Letters name the layer: **U** component spec (jsdom, Testing Library), **C** cross-cutting spec
(\`behavior-contract.spec.ts\`, \`static-value.spec.ts\`), **B** real-browser contract (\`e2e/contracts\`),
**E** docs/consumer e2e, **S** Storybook interaction (\`e2e/storybook/states.spec.ts\`).

Evidence is attributed per component by test title; it is a map to the tests, not proof — open the
test. Nothing is credited to a component because a similar one is covered.

| component | ${header.join(' | ')} |
| --- | ${header.map(() => '---').join(' | ')} |
${rows.join('\n')}

## Gaps

${gaps.length ? gaps.map(g => `- ${g}`).join('\n') : 'None.'}
`;

const config = (await resolveConfig(OUT)) ?? {};
const output = await format(md, { ...config, filepath: OUT });
if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== output) {
    console.error(
      '[behavior-matrix] specs/behavioral-contracts.md is stale → pnpm generate:behavior-matrix'
    );
    process.exit(1);
  }
  console.log('[behavior-matrix] up to date');
} else {
  writeFileSync(OUT, output);
  console.log(`[behavior-matrix] wrote specs/behavioral-contracts.md — ${gaps.length} gaps`);
}
