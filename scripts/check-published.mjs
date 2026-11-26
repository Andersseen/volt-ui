#!/usr/bin/env node
/**
 * Published compatibility: does what the websites advertise as available work with the packages a
 * consumer can install TODAY? (scripts/check-consumer.mjs answers the other question: does the next
 * build work? It packs the source.)
 *
 *   1. registry   npm `latest` of @voltui/components, @voltui/cli and @voltui/agent. If npm cannot be
 *                 read the check stops with exit 2: it never falls back to dist/, cli/ or the workspace.
 *   2. install    a project in the OS temp dir installs exactly those versions from npm (plus Angular,
 *                 Tailwind and the npm packages the compositions import); every package must resolve
 *                 inside that project, at the exact version npm named.
 *   3. claims     every capability in packages/shared/lib/release-capabilities.ts is probed against
 *                 the installed artifacts: npm latest >= since → the probe must pass; otherwise it must
 *                 fail. A claim the published package contradicts fails the check.
 *                 Every public name the docs describe (volt-names.generated.ts) that the published
 *                 package does not export must belong to a capability marked unreleased.
 *   4. commands   every CLI-copy install command the sites show (component examples, compositions) is
 *                 run with the published CLI in an empty directory.
 *   5. compile    with the project's own ngc and strict templates: every complete component usage
 *                 example and every Recipes composition, in package mode (the published
 *                 @voltui/components) and in CLI-copy mode (sources copied by the published CLI).
 *
 * A command or composition listed in packages/shared/lib/published-exceptions.ts must FAIL against
 * the published packages (its page shows a version notice); everything else must pass.
 *
 *   node scripts/check-published.mjs [--angular=22] [--keep]
 *
 * Writes dist/published-report.json. Exit 0 all claims hold, 1 a claim is false, 2 npm unreachable.
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fetchPackument, RegistryError } from './lib/release-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const angular = args.find(a => a.startsWith('--angular='))?.slice(10) ?? '22';
const ngRange = /^\d+$/.test(angular) ? `^${angular}.0.0` : angular;
const keep = args.includes('--keep');

const load = rel => import(pathToFileURL(join(ROOT, rel)).href);
const { RELEASE_CAPABILITIES, compareVersions } = await load(
  'packages/shared/lib/release-capabilities.ts'
);
const { RELEASES } = await load('packages/shared/lib/release-availability.generated.ts');
const { COMPOSITIONS } = await load('packages/shared/lib/compositions.generated.ts');
const { VOLT_NAMES } = await load('packages/shared/lib/volt-names.generated.ts');
const { createDistribution } = await load('packages/shared/lib/distribution.ts');
const { toConsumerSource } = await load('apps/recipes/src/app/lib/snippets/consumer-source.ts');
const { PUBLISHED_COMMAND_EXCEPTIONS, PUBLISHED_COMPOSITION_EXCEPTIONS } = await load(
  'packages/shared/lib/published-exceptions.ts'
);
const usage = await load('apps/web/src/app/lib/snippets/usage.ts');
const distribution = createDistribution(VOLT_NAMES);

const PACKAGES = ['@voltui/components', '@voltui/cli', '@voltui/agent'];
const report = { registry: {}, generated: {}, claims: [], compile: {}, problems: [] };
const problem = message => {
  report.problems.push(message);
  console.error(`  ✖ ${message}`);
};
const ok = message => console.log(`  ✔ ${message}`);

// ---- 1. registry ------------------------------------------------------------------------------
console.log('▶ npm latest (no fallback to local artifacts)');
const latest = {};
for (const name of PACKAGES) {
  try {
    const packument = await fetchPackument(name);
    const version = packument.distTags.latest;
    if (!packument.exists || !version || !packument.versions.includes(version)) {
      throw new RegistryError(`npm has no usable "latest" for ${name}`);
    }
    latest[name] = version;
    report.registry[name] = version;
    report.generated[name] = RELEASES[name]?.published ?? null;
    console.log(`  ${name}@${version}`);
    if (RELEASES[name]?.published !== version) {
      console.warn(
        `  ! the committed release-availability file says ${RELEASES[name]?.published}; npm says ${version} (pnpm stats refreshes it)`
      );
    }
  } catch (error) {
    console.error(
      `\n✖ cannot verify the published packages: ${error.message}\n  Nothing was checked and nothing local was used instead.`
    );
    process.exit(2);
  }
}

// ---- 2. install ---------------------------------------------------------------------------------
const env = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !/^(npm_|pnpm_|NODE_PATH$|INIT_CWD$|PNPM_)/i.test(key)
  )
);
env.npm_config_cache = join(ROOT, '.npm-cache');
env.npm_config_fund = 'false';
env.npm_config_audit = 'false';

const work = realpathSync(mkdtempSync(join(tmpdir(), 'volt-published-')));
process.on('exit', () => {
  if (!keep) rmSync(work, { recursive: true, force: true });
  else console.log(`\n  kept ${work}`);
});
const write = (file, content) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(
    file,
    typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`
  );
};
const run = (command, cmdArgs, cwd) =>
  spawnSync(command, cmdArgs, { cwd, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

const compositionPackages = [...new Set(COMPOSITIONS.flatMap(c => c.packages))];
const lumen = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).dependencies?.[
  'lumen-icons'
];
console.log(`\n▶ install the published packages into ${work} (Angular ${ngRange})`);
const app = join(work, 'app');
write(join(app, 'package.json'), {
  name: 'volt-published-consumer',
  private: true,
  type: 'module',
  dependencies: {
    ...Object.fromEntries(
      ['cdk', 'common', 'compiler', 'core', 'forms', 'platform-browser', 'router'].map(p => [
        `@angular/${p}`,
        ngRange,
      ])
    ),
    '@voltui/components': latest['@voltui/components'],
    rxjs: '^7.8.0',
    tslib: '^2.6.0',
    ...Object.fromEntries(
      compositionPackages.map(p => [p, p === 'lumen-icons' && lumen ? lumen : 'latest'])
    ),
  },
  devDependencies: {
    '@angular/compiler-cli': ngRange,
    typescript: '*',
    '@voltui/cli': latest['@voltui/cli'],
    '@voltui/agent': latest['@voltui/agent'],
  },
});
let r = run('npx', ['--yes', 'npm@11', 'install', '--no-audit', '--no-fund'], app);
if (r.status !== 0) {
  console.error(r.stdout + r.stderr);
  console.error('\n✖ npm install from the registry failed; nothing was checked.');
  process.exit(2);
}
for (const name of PACKAGES) {
  const file = join(app, 'node_modules', name, 'package.json');
  const installed = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
  const where = installed ? realpathSync(dirname(file)) : null;
  if (!installed || installed.version !== latest[name] || !where.startsWith(work)) {
    problem(
      `${name} did not install ${latest[name]} from npm into the project (${installed?.version} at ${where})`
    );
  } else ok(`${name}@${installed.version} installed from npm`);
}
if (report.problems.length) process.exit(1);

// ---- 3. capability claims ---------------------------------------------------------------------
console.log('\n▶ capability claims against the published artifacts');
const volt = join(app, 'node_modules/.bin/volt');
const help = run(volt, ['--help'], app);
const helpText = `${help.stdout}${help.stderr}`;
const agentHome = join(work, 'agent-home');
mkdirSync(agentHome);
run(join(app, 'node_modules/.bin/volt-ui-agent'), ['claude', '--yes'], agentHome);

const publishedTypes = (() => {
  const dir = join(app, 'node_modules/@voltui/components/types');
  return readdirSync(dir)
    .filter(f => f.endsWith('.d.ts'))
    .map(f => readFileSync(join(dir, f), 'utf8'))
    .join('\n');
})();
/** Names the published entry point exports (`export { A, type B, C as D }` and `export declare …`). */
const publishedExports = new Set();
for (const m of publishedTypes.matchAll(/export\s*\{([^}]*)\}/g)) {
  for (const part of m[1].split(',')) {
    const name = part
      .trim()
      .replace(/^type\s+/, '')
      .split(/\s+as\s+/)
      .pop();
    if (name) publishedExports.add(name);
  }
}
for (const m of publishedTypes.matchAll(
  /export (?:declare )?(?:abstract )?(?:class|function|const|let|type|interface|enum) (\w+)/g
)) {
  publishedExports.add(m[1]);
}

let probeDir = 0;
function probe(capability) {
  const p = capability.probe;
  const pkgDir = join(app, 'node_modules', capability.package);
  if (p.kind === 'cli-help') return helpText.includes(p.includes);
  if (p.kind === 'package-file') {
    const file = join(pkgDir, p.file);
    if (!existsSync(file)) return false;
    const text = readFileSync(file, 'utf8');
    return p.pattern ? new RegExp(p.pattern).test(text) : text.includes(p.includes);
  }
  if (p.kind === 'package-export') {
    const exports = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).exports ?? {};
    return Object.hasOwn(exports, p.subpath);
  }
  if (p.kind === 'package-exports') return p.names.every(name => publishedExports.has(name));
  if (p.kind === 'agent-skill') {
    const file = join(agentHome, '.claude/skills', p.skill, 'SKILL.md');
    return existsSync(file) && readFileSync(file, 'utf8').includes(p.includes);
  }
  if (p.kind === 'cli-add') {
    const dir = join(work, `probe-${probeDir++}`);
    mkdirSync(dir, { recursive: true });
    write(join(dir, 'package.json'), { name: 'probe', private: true });
    return run(volt, ['add', ...p.components, 'src/app/ui'], dir).status === 0;
  }
  throw new Error(`unknown probe kind ${p.kind}`);
}
const unreleased = new Set();
for (const capability of RELEASE_CAPABILITIES) {
  const expected = compareVersions(latest[capability.package], capability.since) >= 0;
  if (!expected) unreleased.add(capability.id);
  const found = probe(capability);
  report.claims.push({
    id: capability.id,
    package: capability.package,
    since: capability.since,
    expected,
    found,
  });
  const claim = `${capability.id}: ${expected ? 'available' : 'not published'} in ${capability.package}@${latest[capability.package]}`;
  if (expected === found) ok(claim);
  else
    problem(
      `${claim} — but the published artifact ${found ? 'HAS' : 'LACKS'} it (fix "since" or the probe in release-capabilities.ts)`
    );
}

// Every public name the docs and the MCP describe is either published or covered by a capability
// that says it is not, so no new export is advertised as installable by omission.
const covered = new Set(
  RELEASE_CAPABILITIES.filter(
    c => unreleased.has(c.id) && c.probe.kind === 'package-exports'
  ).flatMap(c => c.probe.names)
);
const uncovered = Object.keys(VOLT_NAMES.exportOwners).filter(
  name => !publishedExports.has(name) && !covered.has(name)
);
report.uncoveredExports = uncovered;
if (uncovered.length) {
  problem(
    `the docs describe exports @voltui/components@${latest['@voltui/components']} does not have, with no unreleased capability naming them: ${uncovered.join(', ')}`
  );
} else ok(`every documented export is published or listed as not published yet`);

// ---- 4. the copy-mode install commands the sites show -----------------------------------------
console.log('\n▶ copy-mode install commands, run with the published CLI in empty projects');
const completeExamples = Object.entries(usage)
  .filter(([, source]) => typeof source === 'string' && /@Component\(/.test(source))
  .map(([name, source]) => ({ name, source }));
const commands = new Map();
for (const { name, source } of completeExamples) {
  const command = distribution.cliAddCommand(source);
  if (command) commands.set(command, [...(commands.get(command) ?? []), `example ${name}`]);
}
for (const c of COMPOSITIONS) {
  const command = c.components.length ? `npx @voltui/cli add ${c.components.join(' ')}` : null;
  if (command) commands.set(command, [...(commands.get(command) ?? []), c.id]);
}
const commandExceptions = new Map(PUBLISHED_COMMAND_EXCEPTIONS.map(e => [e.command, e]));
report.commands = {};
let commandDir = 0;
for (const [command, users] of commands) {
  const dir = join(work, `command-${commandDir++}`);
  mkdirSync(dir, { recursive: true });
  write(join(dir, 'package.json'), { name: 'command', private: true });
  const componentsArgs = command.replace('npx @voltui/cli add ', '').split(' ');
  const result = run(volt, ['add', ...componentsArgs, 'src/app/ui'], dir);
  const works = result.status === 0;
  report.commands[command] = works ? 'pass' : 'fail';
  const exception = commandExceptions.get(command);
  if (works && exception)
    problem(
      `"${command}" now works with the published CLI — remove its PUBLISHED_COMMAND_EXCEPTIONS entry`
    );
  else if (!works && !exception) {
    problem(
      `"${command}" (${users.join(', ')}) fails with the published CLI:\n${(result.stdout + result.stderr).trim().slice(0, 600)}`
    );
  }
}
for (const e of PUBLISHED_COMMAND_EXCEPTIONS) {
  if (!commands.has(e.command))
    problem(`PUBLISHED_COMMAND_EXCEPTIONS lists "${e.command}", which no page shows`);
  if (!unreleased.has(e.capability))
    problem(`"${e.command}" is excused by ${e.capability}, which npm already serves`);
}
const failingCommands = Object.values(report.commands).filter(v => v === 'fail').length;
ok(
  `${commands.size - failingCommands} of ${commands.size} commands work; ${failingCommands} carry a version notice`
);

// ---- 5. compile ---------------------------------------------------------------------------------
console.log(
  '\n▶ compile examples and compositions against the published packages (strict templates)'
);
for (const mode of ['package', 'copy']) {
  for (const { name, source } of completeExamples) {
    write(join(app, 'examples', mode, `${name}.ts`), distribution.sourceFor(source, mode, './ui'));
  }
  for (const c of COMPOSITIONS) {
    const dir = join(ROOT, 'apps/recipes/src/app', c.kind, c.folder);
    for (const file of c.files) {
      const source = toConsumerSource(readFileSync(join(dir, file), 'utf8'));
      write(
        join(app, 'compositions', mode, c.folder, file),
        distribution.sourceFor(source, mode, '../ui')
      );
    }
  }
}
// The published CLI's own copies, one component at a time with --force: whether a multi-component
// command works was answered above; here only the copied source matters.
const listed = JSON.parse(run(volt, ['list', '--json'], app).stdout || '[]').map(c => c.name ?? c);
for (const target of ['examples/copy/ui', 'compositions/copy/ui']) {
  for (const component of listed) {
    const add = run(volt, ['add', component, target, '--force'], app);
    if (add.status !== 0)
      problem(`published volt add ${component} into ${target} failed:\n${add.stdout}${add.stderr}`);
  }
}

const compilerOptions = {
  strict: true,
  noImplicitOverride: true,
  skipLibCheck: true,
  isolatedModules: true,
  importHelpers: true,
  target: 'ES2022',
  module: 'preserve',
  moduleResolution: 'bundler',
  noEmit: true,
  types: [],
  lib: ['ES2022', 'dom'],
};
const angularCompilerOptions = {
  strictTemplates: true,
  strictInjectionParameters: true,
  strictInputAccessModifiers: true,
  extendedDiagnostics: { defaultCategory: 'error' },
};
const ngc = join(app, 'node_modules/.bin/ngc');

/** Compiles `include` and returns the files ngc reported errors in (relative to app). */
function compile(name, include) {
  const tsconfig = join(app, `tsconfig.${name}.json`);
  write(tsconfig, { compilerOptions, angularCompilerOptions, include });
  const out = run(ngc, ['-p', tsconfig], app);
  const text = `${out.stdout}${out.stderr}`.replace(/\x1b\[[0-9;]*m/g, '');
  const files = [...new Set([...text.matchAll(/^([^\s:(]+\.ts)[:(]/gm)].map(m => m[1]))];
  return { status: out.status, files, text };
}

const compositionExceptions = new Map(
  PUBLISHED_COMPOSITION_EXCEPTIONS.map(e => [`${e.mode}:${e.id}`, e])
);
for (const e of PUBLISHED_COMPOSITION_EXCEPTIONS) {
  if (!unreleased.has(e.capability))
    problem(`${e.id} (${e.mode}) is excused by ${e.capability}, which npm already serves`);
}
for (const mode of ['package', 'copy']) {
  const examples = compile(`examples-${mode}`, [`examples/${mode}/*.ts`]);
  const failingExamples = examples.files
    .map(f => f.match(/examples\/\w+\/([^/]+)\.ts$/)?.[1])
    .filter(Boolean);
  report.compile[`examples-${mode}`] = failingExamples;
  if (examples.status === 0)
    ok(`${mode}: all ${completeExamples.length} component usage examples compile`);
  else
    problem(
      `${mode}: component usage examples fail against the published packages: ${failingExamples.join(', ') || examples.text.slice(0, 2000)}`
    );

  const compositions = compile(`compositions-${mode}`, [`compositions/${mode}/*/*.ts`]);
  const failed = new Set(
    compositions.files
      .map(f => f.match(new RegExp(`compositions/${mode}/([^/]+)/`))?.[1])
      .filter(Boolean)
  );
  report.compile[`compositions-${mode}`] = [...failed].sort();
  for (const c of COMPOSITIONS) {
    const exception = compositionExceptions.get(`${mode}:${c.id}`);
    const fails = failed.has(c.folder);
    if (exception && !fails)
      problem(`${mode}: ${c.id} now compiles — remove its PUBLISHED_COMPOSITION_EXCEPTIONS entry`);
    else if (!exception && fails) {
      const lines = compositions.text
        .split('\n')
        .filter(l => l.includes(`/${c.folder}/`))
        .slice(0, 3);
      problem(
        `${mode}: ${c.id} does not compile against the published packages:\n    ${lines.join('\n    ')}`
      );
    }
  }
  if (compositions.status !== 0 && failed.size === 0) {
    problem(
      `${mode}: compositions failed outside any composition folder:\n${compositions.text.slice(0, 2000)}`
    );
  }
  ok(
    `${mode}: ${COMPOSITIONS.length - failed.size} of ${COMPOSITIONS.length} compositions compile`
  );
}

mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(join(ROOT, 'dist/published-report.json'), `${JSON.stringify(report, null, 2)}\n`);
if (report.problems.length) {
  console.error(
    `\n✖ ${report.problems.length} claim(s) do not hold for the published packages (dist/published-report.json)`
  );
  process.exit(1);
}
console.log(
  `\n✔ What the sites advertise holds for ${PACKAGES.map(n => `${n}@${latest[n]}`).join(', ')} (dist/published-report.json)`
);
