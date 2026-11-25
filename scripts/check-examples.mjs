#!/usr/bin/env node
/**
 * Every example Volt UI hands a consumer to copy compiles, in the mode it is shown in.
 *
 * Inventory (also written to <out>/inventory.json):
 *
 *   complete   the component usage examples (apps/web/src/app/lib/snippets/usage.ts): a whole
 *              standalone component, shown on the component pages and served by the MCP server
 *              (`get_usage_example`). Compiled in BOTH modes — package (`@voltui/components`) and
 *              CLI copy (the same source through packages/shared/lib/distribution.ts, against the
 *              files `volt add` really copies).
 *   partial    the MCP template fragments (apps/web/src/server/routes/mcp/editorial.ts). Compiled
 *              inside the documented host: a standalone component importing every Volt directive
 *              plus CommonModule, FormsModule, ReactiveFormsModule and RouterLink, whose members are
 *              untyped (`[key: string]: any`), so only selectors, inputs, outputs and their literal
 *              values are checked — which is what a fragment claims.
 *   blocks     Recipes blocks, layouts and patterns: complete, package mode only; compiled by
 *              scripts/check-copied-source.mjs (unchanged, not weakened).
 *
 * Static rules on top of compilation: no `'volt'` alias, no relative or docs-app import, no
 * NO_ERRORS_SCHEMA / CUSTOM_ELEMENTS_SCHEMA, no npm package outside Angular, rxjs and
 * @voltui/components, and an example for every component the MCP server serves.
 *
 *   node scripts/check-examples.mjs                  compile both modes against dist/volt (build:lib first)
 *   node scripts/check-examples.mjs --emit <dir>     only write the example sources (for the isolated
 *                                                    consumer harness, scripts/check-consumer.mjs)
 *   --mode=package | --mode=copy                     one mode only
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const emitIndex = args.indexOf('--emit');
const emitDir = emitIndex !== -1 ? resolve(args[emitIndex + 1]) : null;
const modeArg = args.find(a => a.startsWith('--mode='))?.slice(7);
const MODES = modeArg ? [modeArg] : ['package', 'copy'];

const load = rel => import(pathToFileURL(join(ROOT, rel)).href);
const usage = await load('apps/web/src/app/lib/snippets/usage.ts');
const { EDITORIAL } = await load('apps/web/src/server/routes/mcp/editorial.ts');
const { COMPONENT_API } = await load('apps/web/src/server/routes/mcp/api.generated.ts');
const { VOLT_NAMES } = await load('packages/shared/lib/volt-names.generated.ts');
const { createDistribution } = await load('packages/shared/lib/distribution.ts');
const distribution = createDistribution(VOLT_NAMES);

const ALLOWED_PACKAGES = [/^@angular\//, /^@voltui\/components$/, /^rxjs(\/|$)/];
const problems = [];

// ---- inventory ------------------------------------------------------------------------------
// A usage snippet that is a whole `@Component` is complete; one that is only markup (the sidebar
// sizing note: a template line and a stylesheet) is partial and compiled in the host below.
const snippets = Object.entries(usage).filter(([, value]) => typeof value === 'string');
const complete = snippets
  .filter(([, source]) => /@Component\(/.test(source))
  .map(([name, source]) => ({ name, file: `${name.toLowerCase().replace(/_/g, '-')}.ts`, source }));
const partialUsage = snippets.filter(([, source]) => !/@Component\(/.test(source));

for (const { name, source } of complete) {
  if (/from\s+['"]volt['"]/.test(source))
    problems.push(`${name}: imports the monorepo 'volt' alias`);
  if (/NO_ERRORS_SCHEMA|CUSTOM_ELEMENTS_SCHEMA/.test(source))
    problems.push(`${name}: uses a schema that hides template errors`);
  for (const [, spec] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    if (spec.startsWith('.'))
      problems.push(`${name}: relative import "${spec}" a consumer does not have`);
    else if (!ALLOWED_PACKAGES.some(re => re.test(spec)))
      problems.push(
        `${name}: imports "${spec}", which is not a documented dependency of the example`
      );
  }
}

const partial = partialUsage.map(([name, template]) => ({
  name,
  component: name.toLowerCase().replace(/_/g, '-'),
  index: 0,
  template,
}));
for (const [component, entry] of Object.entries(EDITORIAL)) {
  if (!COMPONENT_API[component]) problems.push(`editorial.ts: "${component}" is not a component`);
  if (!entry.examples.length && !entry.code?.length)
    problems.push(`editorial.ts: "${component}" has no example`);
  entry.examples.forEach((template, index) => {
    if (!/^\s*</.test(template))
      problems.push(
        `editorial.ts: ${component} example ${index + 1} is not a template (move it to code)`
      );
    partial.push({ name: `${component}#${index + 1}`, component, index, template });
  });
  (entry.code ?? []).forEach((code, index) => {
    partial.push({ name: `${component}#code${index + 1}`, component, index, code });
  });
}
for (const component of Object.keys(COMPONENT_API)) {
  if (!EDITORIAL[component]) problems.push(`editorial.ts: no entry for "${component}"`);
}

if (problems.length) {
  console.error(`Examples break the consumer rules:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}

// ---- sources ----------------------------------------------------------------------------------
// Every Volt directive, plus the ng-primitives structural render directives Volt re-exports
// (`*ngpDatePickerRowRender`, `*ngpDatePickerCellRender`), which a date picker template needs.
const directives = [
  ...new Set(
    Object.values(COMPONENT_API).flatMap(api => [
      ...api.directives.map(d => d.className),
      ...api.imports.filter(name => /^Ngp\w*Render$/.test(name)),
    ])
  ),
].sort();

const escapeTemplate = text =>
  text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

function hostSource(example) {
  if (example.code) return codeHostSource(example);
  return `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ${directives.join(', ')} } from '@voltui/components';

// Host for the MCP example ${example.name}: every Volt directive, untyped members.
@Component({
  selector: 'example-host',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ${directives.join(', ')}],
  template: \`${escapeTemplate(example.template)}\`,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ExampleHost { [key: string]: any; }
`;
}

/** TypeScript examples: class-body code, or statements inside a method of such a class. */
function codeHostSource(example) {
  const { placement, source } = example.code;
  const used = Object.keys(VOLT_NAMES.exportOwners).filter(name =>
    new RegExp(`(?<![\\w$])${name}(?![\\w$])`).test(source)
  );
  const body = placement === 'member' ? source : `run(): void {\n${source}\n}`;
  return `import { Component, TemplateRef, inject, viewChild } from '@angular/core';
${used.length ? `import { ${used.join(', ')} } from '@voltui/components';\n` : ''}
// Host for the MCP code example ${example.name} (${placement}).
@Component({ selector: 'example-host', template: '' })
export class ExampleHost {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  readonly _keep = [inject, viewChild, TemplateRef];
${body}
}
`;
}

/** Writes `<dir>/<mode>/{complete,partial}/*.ts`. Copy mode imports from `<dir>/copy/ui`. */
function emit(dir) {
  const written = { package: [], copy: [] };
  for (const mode of MODES) {
    for (const { file, source } of complete) {
      const target = join(dir, mode, 'complete', file);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, distribution.sourceFor(source, mode, '../ui'));
      written[mode].push(target);
    }
    for (const example of partial) {
      const target = join(
        dir,
        mode,
        'partial',
        `${example.component}-${example.code ? 'code' : ''}${example.index + 1}.ts`
      );
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, distribution.sourceFor(hostSource(example), mode, '../ui'));
      written[mode].push(target);
    }
  }
  const inventory = {
    complete: complete.map(c => ({
      name: c.name,
      components: distribution.componentsUsed(c.source),
      modes: ['package', 'copy'],
    })),
    partial: partial.map(p => ({
      name: p.name,
      host: 'ExampleHost (every Volt directive, untyped members)',
    })),
    blocks: 'scripts/check-copied-source.mjs (package mode)',
  };
  writeFileSync(join(dir, 'inventory.json'), JSON.stringify(inventory, null, 2));
  return written;
}

if (emitDir) {
  rmSync(emitDir, { recursive: true, force: true });
  emit(emitDir);
  console.log(
    `Wrote ${complete.length} complete and ${partial.length} partial examples (${MODES.join(' + ')}) to ${emitDir}`
  );
  process.exit(0);
}

// ---- compile ----------------------------------------------------------------------------------
const OUT = join(ROOT, 'dist/examples');
const LIB = join(ROOT, 'dist/volt');
if (MODES.includes('package') && !existsSync(join(LIB, 'package.json'))) {
  console.error('dist/volt is missing — run "pnpm build:lib" first.');
  process.exit(1);
}
rmSync(OUT, { recursive: true, force: true });
emit(OUT);

if (MODES.includes('copy')) {
  // The real CLI copies the whole catalog where the examples import it from.
  const all = Object.keys(COMPONENT_API);
  execFileSync(
    'node',
    [join(ROOT, 'cli/bin/volt'), 'add', ...all, `--path=${join(OUT, 'copy/ui')}`],
    {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'inherit'],
    }
  );
}

const compilerOptions = {
  strict: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  skipLibCheck: true,
  isolatedModules: true,
  importHelpers: true,
  target: 'ES2022',
  module: 'preserve',
  moduleResolution: 'bundler',
  noEmit: true,
  types: [],
  typeRoots: [],
};
const angularCompilerOptions = {
  strictInjectionParameters: true,
  strictInputAccessModifiers: true,
  strictTemplates: true,
  // Extended diagnostics are errors too (a structural directive used without its import renders
  // nothing); only "unused standalone imports" is off, because the host imports every directive.
  extendedDiagnostics: { defaultCategory: 'error', checks: { unusedStandaloneImports: 'suppress' } },
};

let failed = false;
for (const mode of MODES) {
  const tsconfig = join(OUT, mode, 'tsconfig.json');
  writeFileSync(
    tsconfig,
    JSON.stringify(
      {
        compilerOptions: {
          ...compilerOptions,
          // Package mode: the only mapping a consumer has is the package itself.
          ...(mode === 'package' ? { paths: { '@voltui/components': [LIB] } } : {}),
        },
        angularCompilerOptions,
        include: ['**/*.ts'],
      },
      null,
      2
    )
  );
  console.log(
    `\n▶ ${mode} mode: ${complete.length} complete + ${partial.length} partial examples (strict templates)`
  );
  try {
    execFileSync(join(ROOT, 'node_modules/.bin/ngc'), ['-p', tsconfig], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    console.log(`✔ every ${mode}-mode example compiles`);
  } catch {
    console.error(`✖ ${mode}-mode examples do not compile (sources in ${join(OUT, mode)})`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
