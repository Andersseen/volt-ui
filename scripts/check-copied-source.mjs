#!/usr/bin/env node
/**
 * Compiles what the Blocks, Layouts and Recipes "copy" button hands a visitor, in a workspace that has
 * none of this repository's context: no `volt` alias, no docs-app paths. `@voltui/components`
 * resolves to the built library (`dist/volt`, run `pnpm build:lib` first), the same artifact
 * `npm pack` ships.
 *
 * Catches: a leftover `volt` import, a relative or docs-only import, a symbol the package does
 * not export, and template errors under `strictTemplates`.
 *
 * Usage: node scripts/check-copied-source.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toConsumerSource } from '../apps/recipes/src/app/lib/snippets/consumer-source.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist/copied-source');
const LIB = join(ROOT, 'dist/volt');

if (!existsSync(join(LIB, 'package.json'))) {
  console.error('dist/volt is missing — run "pnpm build:lib" first.');
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });

let copied = 0;
for (const kind of ['blocks', 'layouts', 'recipes']) {
  const dir = join(ROOT, 'apps/recipes/src/app', kind);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = join(dir, entry.name, `${entry.name}.ts`);
    if (!existsSync(file)) continue;
    const target = join(OUT, kind, entry.name, `${entry.name}.ts`);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, toConsumerSource(readFileSync(file, 'utf8')));
    copied++;
  }
}

writeFileSync(
  join(OUT, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        strict: true,
        noImplicitOverride: true,
        skipLibCheck: true,
        isolatedModules: true,
        experimentalDecorators: true,
        importHelpers: true,
        target: 'ES2022',
        module: 'preserve',
        moduleResolution: 'bundler',
        noEmit: true,
        types: [],
        // The only mapping a consumer has: the package. No `volt`, no `src/…`. (No `baseUrl`: deprecated in TS 6; `paths` resolve against this tsconfig.)
        paths: { '@voltui/components': [LIB] },
        typeRoots: [],
      },
      angularCompilerOptions: {
        strictInjectionParameters: true,
        strictInputAccessModifiers: true,
        strictTemplates: true,
      },
      include: ['**/*.ts'],
    },
    null,
    2
  )
);

console.log(`Compiling ${copied} copied block/layout/recipe sources against dist/volt…`);
try {
  execFileSync(join(ROOT, 'node_modules/.bin/ngc'), ['-p', join(OUT, 'tsconfig.json')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
} catch {
  console.error('\nCopied source does not compile in a consumer workspace.');
  process.exit(1);
}
console.log('Every copied block, layout and recipe compiles.');
