/**
 * Real `npm pack` tarballs of the three published packages, for the consumer harnesses. Nothing is
 * published and no token is needed. Used by scripts/check-consumer.mjs and
 * scripts/check-quartz-consumer.mjs.
 *
 *   @voltui/components   dist/volt (pnpm build:lib)
 *   @voltui/cli          cli/ — its prepack copies the registry (manifest + library source) into
 *                        cli/registry and postpack removes it; the registry is removed here as well
 *                        whatever happens, so a failed pack never leaves it behind
 *   @voltui/agent        cli/agent
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

function npmPack(cwd, dest, env) {
  const result = spawnSync('npm', ['pack', '--json', '--pack-destination', dest], {
    cwd,
    env,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`npm pack failed in ${cwd}:\n${result.stderr || result.stdout}`);
  }
  // npm prints lifecycle output before the JSON array on stdout.
  const json = result.stdout.slice(result.stdout.indexOf('['));
  const [info] = JSON.parse(json);
  return { file: join(dest, info.filename), name: info.name, version: info.version, files: info.files.length, size: info.size };
}

/**
 * @param {{ root: string, dest: string, build?: boolean, env?: NodeJS.ProcessEnv, log?: (m: string) => void }} options
 */
export function packAll({ root, dest, build = true, env = process.env, log = console.log }) {
  const run = (label, command, args) => {
    log(`\n▶ ${label}\n  $ ${command} ${args.join(' ')}`);
    const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`"${label}" failed (exit ${result.status})`);
  };

  if (build || !existsSync(join(root, 'dist/volt/package.json'))) {
    run('build the library', 'pnpm', ['build:lib']);
  }
  // The CLI registry ships this manifest: build it from the current source, never reuse a stale one.
  run('generate the CLI manifest', 'node', [join(root, 'cli/generate-manifest.js')]);

  const registry = join(root, 'cli/registry');
  const tarballs = {};
  try {
    log('\n▶ pack @voltui/components, @voltui/cli and @voltui/agent');
    tarballs.components = npmPack(join(root, 'dist/volt'), dest, env);
    tarballs.cli = npmPack(join(root, 'cli'), dest, env);
    tarballs.agent = npmPack(join(root, 'cli/agent'), dest, env);
  } finally {
    rmSync(registry, { recursive: true, force: true });
  }
  if (existsSync(registry)) throw new Error('cli/registry was left behind after packing');

  const expected = {
    components: JSON.parse(readFileSync(join(root, 'packages/volt/package.json'), 'utf8')).version,
    cli: JSON.parse(readFileSync(join(root, 'cli/package.json'), 'utf8')).version,
    agent: JSON.parse(readFileSync(join(root, 'cli/agent/package.json'), 'utf8')).version,
  };
  for (const [key, tarball] of Object.entries(tarballs)) {
    if (tarball.version !== expected[key]) {
      throw new Error(`${tarball.name} packed as ${tarball.version}, source says ${expected[key]}`);
    }
    log(`  ${tarball.name}@${tarball.version}: ${tarball.files} files, ${(tarball.size / 1024).toFixed(1)} KiB`);
  }
  return tarballs;
}
