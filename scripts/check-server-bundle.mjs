import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const serverOutput = 'dist/analog/public/_worker.js';
const forbiddenImports = [
  { pattern: /(?:^|[/\\])vitest(?:[/\\]|$)/, label: 'Vitest runtime' },
  { pattern: /@vitest[/\\]/, label: 'Vitest internals' },
];

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else {
      yield path;
    }
  }
}

const violations = [];

for await (const path of walk(serverOutput)) {
  if (!['.js', '.mjs', '.cjs'].includes(extname(path))) continue;

  const source = await readFile(path, 'utf8');
  for (const forbidden of forbiddenImports) {
    if (forbidden.pattern.test(source)) {
      violations.push(`${forbidden.label} found in ${path}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Server bundle contains test-only dependencies:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('Server bundle contains no test-only dependencies.');
}
