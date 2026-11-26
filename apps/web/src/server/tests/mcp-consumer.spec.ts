import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../routes/mcp';
import { buildCliCommand, shellQuote } from '../routes/mcp/consumer-context';
import { COMPOSITIONS } from '../../../../../packages/shared/lib/compositions.generated';
import { RELEASES } from '../../../../../packages/shared/lib/release-availability.generated';
import {
  RELEASE_CAPABILITIES,
  compareVersions,
} from '../../../../../packages/shared/lib/release-capabilities';

const KEYS = ['button', 'card', 'dialog', 'sidebar', 'tooltip', 'table'];

describe('buildCliCommand (no execution, untrusted input)', () => {
  const ok = (result: ReturnType<typeof buildCliCommand>) => {
    if ('error' in result) throw new Error(result.error);
    return result;
  };

  it('keeps the existing command shape for a known component', () => {
    const r = ok(buildCliCommand({ action: 'add', components: ['card'] }, KEYS));
    expect(r.command).toBe('npx @voltui/cli add card');
    expect(r.argv).toEqual(['npx', '@voltui/cli', 'add', 'card']);
  });

  it('accepts several components, once each, in order', () => {
    const r = ok(buildCliCommand({ action: 'add', components: ['card', 'button', 'card'] }, KEYS));
    expect(r.argv.slice(2)).toEqual(['add', 'card', 'button']);
  });

  it('rejects unknown components with suggestions instead of interpolating them', () => {
    const r = buildCliCommand({ action: 'add', components: ['buton', 'card; rm -rf ~'] }, KEYS);
    expect('error' in r && r.error).toMatch(/Unknown components: buton, card; rm -rf ~/);
    expect('suggestions' in r && r.suggestions?.['buton']).toContain('button');
  });

  it('quotes paths with spaces and shell-special characters; argv stays unquoted', () => {
    const r = ok(
      buildCliCommand({ action: 'add', components: ['card'], targetDir: 'src/my ui/$(x)' }, KEYS)
    );
    expect(r.command).toBe(`npx @voltui/cli add card '--path=src/my ui/$(x)'`);
    expect(r.argv.at(-1)).toBe('--path=src/my ui/$(x)');
    expect(shellQuote(`it's`)).toBe(`'it'\\''s'`);
  });

  it('refuses control characters, option-looking and climbing paths', () => {
    for (const targetDir of ['src/ui\nrm -rf /', '--force', '../outside', '   ']) {
      const r = buildCliCommand({ action: 'add', components: ['card'], targetDir }, KEYS);
      expect('error' in r, JSON.stringify(targetDir)).toBe(true);
    }
  });

  it('refuses unsupported flag combinations and arguments', () => {
    const bad = [
      { action: 'diff', components: [] },
      { action: 'list', components: ['card'] },
      { action: 'init', components: ['card'] },
      { action: 'list', components: [], targetDir: 'src' },
      { action: 'diff', components: ['card'], track: true },
      { action: 'add', components: ['card'], json: true },
      { action: 'add', components: ['card'], cliVersion: '^1.3.0' },
    ] as const;
    for (const request of bad) {
      expect('error' in buildCliCommand(request, KEYS), JSON.stringify(request)).toBe(true);
    }
  });

  it('with a supplied CLI version, an operation it lacks is an actionable error', () => {
    const r = buildCliCommand(
      { action: 'diff', components: ['button'], cliVersion: '1.3.3' },
      KEYS
    );
    expect('error' in r && r.error).toMatch(/@voltui\/cli 1\.3\.3 cannot run this.*needs 1\.4\.0/);
    expect('missing' in r && r.missing?.map(m => m.id)).toEqual(['cli.diff']);
  });

  it('with an older CLI, --path becomes the positional destination every version understands', () => {
    const r = ok(
      buildCliCommand(
        { action: 'add', components: ['card'], targetDir: 'src/ui', cliVersion: '1.3.3' },
        KEYS
      )
    );
    expect(r.command).toBe('npx @voltui/cli add card src/ui');
    expect(r.notes.join()).toMatch(/no --path/);
    const current = ok(
      buildCliCommand(
        { action: 'add', components: ['card'], targetDir: 'src/ui', cliVersion: '1.4.0' },
        KEYS
      )
    );
    expect(current.command).toBe('npx @voltui/cli add card --path=src/ui');
  });

  it('without a version it describes the source and says what npm latest lacks', () => {
    const r = ok(
      buildCliCommand({ action: 'add', components: ['card'], targetDir: 'src/ui' }, KEYS)
    );
    const path = RELEASE_CAPABILITIES.find(c => c.id === 'cli.path')!;
    const published = RELEASES['@voltui/cli'].published;
    if (published && compareVersions(published, path.since) < 0) {
      expect(r.availability?.status).toBe('unreleased');
      expect(r.availability?.missing.map(m => m.id)).toEqual(['cli.path']);
      expect(r.availability?.publishedAlternative?.command).toBe('npx @voltui/cli add card src/ui');
      // Never an unpublished version pinned in the command.
      expect(r.command).not.toMatch(/@voltui\/cli@/);
    } else {
      expect(r.availability).toBeUndefined();
    }
  });
});

describe('MCP version context and compositions', () => {
  let client: Client;
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const result = await client.callTool({ name, arguments: args });
    const text = (result.content as { type: string; text: string }[])[0].text;
    return { isError: !!result.isError, body: JSON.parse(text) };
  };

  beforeAll(async () => {
    const server = createMcpServer();
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'consumer-client', version: '1.0.0' }, { capabilities: {} });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('get_project_info separates the described source from what npm serves', async () => {
    const { body } = await call('get_project_info');
    expect(body.versions.describes['@voltui/components']).toBe(
      RELEASES['@voltui/components'].source
    );
    expect(body.versions.publishedOnNpm['@voltui/cli']).toBe(RELEASES['@voltui/cli'].published);
    expect(body.versions.capabilities.map((c: { id: string }) => c.id)).toEqual(
      RELEASE_CAPABILITIES.map(c => c.id)
    );
    expect(body.name).toBe('Volt UI'); // existing fields unchanged
  });

  it('get_project_info with installed versions says what that project lacks', async () => {
    const { body } = await call('get_project_info', { cliVersion: '1.3.3' });
    const diff = body.versions.capabilities.find((c: { id: string }) => c.id === 'cli.diff');
    expect(diff.installed).toBe('unavailable');
    expect(body.versions.installed).toEqual({ cli: '1.3.3' });
  });

  it('get_component reports the component capabilities an installed version lacks', async () => {
    const { body } = await call('get_component', {
      name: 'textarea',
      mode: 'package',
      componentsVersion: '1.3.3',
    });
    expect(body.availability.installedVersion).toBe('1.3.3');
    expect(body.availability.notInInstalledVersion.map((c: { id: string }) => c.id)).toEqual(
      expect.arrayContaining([
        'components.numeric-attribute-strings',
        'components.input-describedby',
      ])
    );
    expect(body.selectors).toBeDefined(); // the existing payload is still there
  });

  it('generate_cli_command returns argv and keeps the single-component input working', async () => {
    const { body } = await call('generate_cli_command', {
      action: 'add',
      component: 'dialog',
      targetDir: 'src/app/my ui',
    });
    expect(body.command).toBe(`npx @voltui/cli add dialog '--path=src/app/my ui'`);
    expect(body.argv).toEqual(['npx', '@voltui/cli', 'add', 'dialog', '--path=src/app/my ui']);
  });

  it('generate_cli_command takes several components and rejects an unknown one', async () => {
    expect(
      (await call('generate_cli_command', { action: 'add', components: ['card', 'button'] })).body
        .command
    ).toBe('npx @voltui/cli add card button');
    const bad = await call('generate_cli_command', { action: 'add', components: ['carrd'] });
    expect(bad.isError).toBe(true);
    expect(bad.body.suggestions.carrd).toContain('card');
  });

  it('find_compositions finds workflow patterns with what the application owns', async () => {
    const { body } = await call('find_compositions', { intent: 'settings form with validation' });
    const settings = body.find((c: { id: string }) => c.id === 'recipes/settings-form');
    expect(settings).toBeDefined();
    expect(settings.url).toBe('https://recipes.voltui.dev/patterns/settings-form');
    expect(settings.components).toEqual(expect.arrayContaining(['form-field', 'input', 'button']));
    expect(settings.install.copy.commands[0]).toMatch(/^npx @voltui\/cli add /);
    expect(settings.applicationOwned.connect).toMatch(/fakeSave/);
  });

  it('find_compositions filters by kind and component, from the generated manifest', async () => {
    const { body } = await call('find_compositions', {
      kind: 'layouts',
      component: 'sidebar',
      limit: 20,
    });
    const expected = COMPOSITIONS.filter(
      c => c.kind === 'layouts' && c.components.includes('sidebar')
    );
    expect(body.map((c: { id: string }) => c.id).sort()).toEqual(expected.map(c => c.id).sort());
    expect(
      body.every((c: { install: { package: { command: string } } }) =>
        c.install.package.command.startsWith('npm install @voltui/components')
      )
    ).toBe(true);
  });

  it('find_compositions lists every external package the source imports', async () => {
    const { body } = await call('find_compositions', { kind: 'blocks', limit: 20 });
    for (const entry of body) {
      const manifest = COMPOSITIONS.find(c => c.id === entry.id)!;
      for (const pkg of manifest.packages) expect(entry.install.package.command).toContain(pkg);
    }
  });

  it('find_compositions rejects an unknown component and hints when nothing matches', async () => {
    expect((await call('find_compositions', { component: 'nope' })).isError).toBe(true);
    const none = await call('find_compositions', { intent: 'zzqx quantum' });
    expect(none.body.matches).toEqual([]);
  });
});
