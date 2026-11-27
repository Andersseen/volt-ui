import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import {
  SERVER_INVENTORY,
  createMcpServer,
  discoveryResponse,
  findComponents,
  forMode,
  withStreamableAccept,
} from '../routes/mcp';
import { RESPONSIBILITIES } from '../routes/mcp/responsibilities.generated';

describe('Volt UI MCP Server', () => {
  let client: Client;

  beforeAll(async () => {
    const server = createMcpServer();
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('should list tools', async () => {
    const result = await client.listTools();
    const names = result.tools.map(t => t.name);
    expect(names).toEqual([
      'list_components',
      'find_components',
      'get_component',
      'get_usage_example',
      'get_theme_info',
      'get_project_info',
      'find_compositions',
      'generate_cli_command',
    ]);
  });

  it('should call get_component', async () => {
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'button' } });
    const text = (result.content as { type: string; text: string }[]).find(
      c => c.type === 'text'
    )?.text;
    expect(text).toContain('"name": "Button"');
    expect(text).toContain('solid');
  });

  it('get_theme_info explains the custom-theme contract, additively', async () => {
    const result = await client.callTool({ name: 'get_theme_info', arguments: {} });
    const info = JSON.parse(
      (result.content as { type: string; text: string }[]).find(c => c.type === 'text')!.text
    );
    // What older clients read is unchanged.
    expect(info.colors).toEqual(['volt', 'ember', 'sage', 'dusk', 'glacier']);
    expect(info.provider).toBe('provideVoltTheme');
    // The contract a model needs to wire a Theme Studio export.
    expect(info.customThemes.usage).toContain("voltCustomColor('acme')");
    expect(info.customThemes.steps.join('\n')).toContain("@import '@voltui/components/themes.css'");
    expect(info.customThemes.copyMode).toContain('uiCustomColor');
    expect(info.customThemes.availability.id).toBe('components.custom-themes');
    expect(info.customThemes.availability.since).toBe('1.4.1');
  });

  it('should call get_usage_example', async () => {
    const result = await client.callTool({
      name: 'get_usage_example',
      arguments: { component: 'button' },
    });
    const text = (result.content as { type: string; text: string }[]).find(
      c => c.type === 'text'
    )?.text;
    expect(text).toContain('UiButton');
    expect(text).toContain('@voltui/components');
  });

  it('should call generate_cli_command', async () => {
    const result = await client.callTool({
      name: 'generate_cli_command',
      arguments: { action: 'add', component: 'button' },
    });
    const text = (result.content as { type: string; text: string }[]).find(
      c => c.type === 'text'
    )?.text;
    expect(text).toContain('npx @voltui/cli add button');
  });

  it('should list resources', async () => {
    const result = await client.listResources();
    const uris = result.resources.map(r => r.uri);
    expect(uris).toContain('theme://info');
    expect(uris).toContain('project://info');
    expect(uris.some(uri => uri.startsWith('component://'))).toBe(true);
  });

  it('should read a component resource', async () => {
    const result = await client.readResource({ uri: 'component://button' });
    const text = result.contents[0]?.text;
    expect(text).toContain('"name": "Button"');
  });

  it('should list prompts', async () => {
    const result = await client.listPrompts();
    const names = result.prompts.map(p => p.name);
    expect(names).toContain('generate-volt-ui-component');
    expect(names).toContain('volt-ui-troubleshooting');
  });

  it('should get a prompt', async () => {
    const result = await client.getPrompt({
      name: 'generate-volt-ui-component',
      arguments: { component: 'button' },
    });
    const text = (result.messages[0].content as { type: string; text: string }).text;
    expect(text).toContain('Button');
    expect(text).toContain('UiButton');
    expect(text).toContain('Volt UI');
    expect(text).toContain('OnPush');
    expect(text).toContain('Tailwind CSS');
  });
});

describe('HTTP transport', () => {
  const initialize = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' },
    },
  };

  async function post(accept: string | null) {
    const headers = new Headers({ 'content-type': 'application/json' });
    if (accept !== null) headers.set('accept', accept);
    const request = await withStreamableAccept(
      new Request('https://voltui.dev/api/mcp', {
        method: 'POST',
        headers,
        body: JSON.stringify(initialize),
      })
    );
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await createMcpServer().connect(transport);
    return transport.handleRequest(request);
  }

  it.each([
    ['both types', 'application/json, text/event-stream'],
    ['only JSON', 'application/json'],
    ['a wildcard', '*/*'],
    ['no Accept header', null],
  ])('answers initialize when the client sends %s', async (_label, accept) => {
    const response = await post(accept);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.result.serverInfo.name).toBe('volt-ui');
  });
});

async function connect(): Promise<Client> {
  const server = createMcpServer();
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });
  await client.connect(clientTransport);
  return client;
}

let c: Client;
beforeAll(async () => {
  c = await connect();
});
afterAll(async () => {
  await c.close();
});

const textOf = (result: { content?: unknown }) =>
  (result.content as { type: string; text: string }[]).find(c => c.type === 'text')!.text;

describe('component responsibilities', () => {
  it('every component the server serves says what it is for and where it stops', async () => {
    const listed = JSON.parse(textOf(await c.callTool({ name: 'list_components', arguments: {} })));
    expect(listed.length).toBeGreaterThan(30);
    for (const c of listed) {
      expect(RESPONSIBILITIES[c.name], `${c.name} has no responsibility metadata`).toBeDefined();
      expect(c.category, c.name).toBeTruthy();
      expect(['stable', 'beta', 'experimental'], c.name).toContain(c.status);
      expect(c.responsibility, c.name).toBeTruthy();
    }
  });

  it('get_component carries the responsibility, with status from COMPONENT_STATUS.md', async () => {
    const dialog = JSON.parse(
      textOf(await c.callTool({ name: 'get_component', arguments: { name: 'dialog' } }))
    );
    expect(dialog.responsibility.status).toBe('stable');
    expect(dialog.responsibility.notFor.join(' ')).toMatch(/Drawer/);
    expect(dialog.responsibility.related).toContain('drawer');
  });

  it('list_components filters by status and category', async () => {
    const beta = JSON.parse(
      textOf(await c.callTool({ name: 'list_components', arguments: { status: 'beta' } }))
    );
    // Spinner and Empty State were the last beta components; both are stable now.
    expect(beta).toEqual([]);
    const stable = JSON.parse(
      textOf(await c.callTool({ name: 'list_components', arguments: { status: 'stable' } }))
    );
    expect(stable.map((c: { name: string }) => c.name)).toEqual(
      expect.arrayContaining(['empty-state', 'spinner'])
    );
    const overlays = JSON.parse(
      textOf(await c.callTool({ name: 'list_components', arguments: { category: 'Overlays' } }))
    );
    expect(overlays.map((c: { name: string }) => c.name)).toEqual(
      expect.arrayContaining(['dialog', 'drawer', 'popover', 'tooltip', 'dropdown-menu', 'toast'])
    );
  });
});

describe('find_components', () => {
  it.each([
    ['confirm a destructive action before deleting', 'dialog'],
    ['a transient notification after saving', 'toast'],
    ['let the user search a long list as they type', 'combobox'],
    ['show that content is loading', 'skeleton'],
    ['an on/off setting that applies immediately', 'switch'],
  ])('"%s" finds %s', (intent, expected) => {
    expect(findComponents(intent, { limit: 3 }).map(c => c.key)).toContain(expected);
  });

  it('returns a hint, not an empty success, when nothing matches', async () => {
    const result = JSON.parse(
      textOf(await c.callTool({ name: 'find_components', arguments: { intent: 'zzqx qqzz' } }))
    );
    expect(result.matches).toEqual([]);
    expect(result.hint).toMatch(/rather than rebuilding/);
  });
});

describe('distribution mode', () => {
  it('package mode renames selectors and classes; copy mode keeps the CLI names', async () => {
    const pkg = JSON.parse(
      textOf(
        await c.callTool({
          name: 'get_component',
          arguments: { name: 'card', mode: 'package' },
        })
      )
    );
    expect(JSON.stringify(pkg)).toContain('volt-card');
    expect(JSON.stringify(pkg.examples)).not.toMatch(/\bui-|\bUi[A-Z]/);
    const copy = JSON.parse(
      textOf(await c.callTool({ name: 'get_component', arguments: { name: 'card', mode: 'copy' } }))
    );
    expect(JSON.stringify(copy.examples)).toContain('ui-card');
  });

  it('the npm import names the class the package really exports (Volt*, not Ui*)', async () => {
    const example = JSON.parse(
      textOf(await c.callTool({ name: 'get_usage_example', arguments: { component: 'button' } }))
    );
    // Every class a template of the component may need, not only the one named after it.
    expect(example.imports.npm).toBe(
      "import { VoltButton, VoltNativeButton } from '@voltui/components';"
    );
    expect(example.imports.cli).toBe("import { UiButton, UiNativeButton } from './ui/button';");
    // The complete example shown on voltui.dev, in both modes, with the CLI command for the copy.
    expect(example.source.package).toContain("from '@voltui/components'");
    expect(example.source.copy).toContain("from './ui/button'");
    expect(example.source.copy).toContain('<button uiButton');
    expect(example.source.copy).not.toContain('@voltui/components');
    expect(example.cli).toBe('npx @voltui/cli add button spinner');
  });

  it('a mode returns only that mode’s import', async () => {
    const pkg = JSON.parse(
      textOf(
        await c.callTool({
          name: 'get_usage_example',
          arguments: { component: 'badge', mode: 'package' },
        })
      )
    );
    expect(Object.keys(pkg.imports)).toEqual(['npm']);
    expect(JSON.stringify(pkg.examples)).toContain('<volt-badge');
  });

  it('forMode renames attribute directives and leaves the rest of the text alone', () => {
    // Metadata is held in package names; copy mode (the default) renames only declared names.
    expect(forMode('<button voltButton>Volt UI kit, volt</button>', 'copy')).toBe(
      '<button uiButton>Volt UI kit, volt</button>'
    );
    expect(forMode('<volt-card class="[--volt-radius:0]">', undefined)).toBe(
      '<ui-card class="[--volt-radius:0]">'
    );
    expect(forMode('<volt-card>', 'package')).toBe('<volt-card>');
  });
});

describe('technical facts come from the source', () => {
  const component = async (name: string, mode?: 'package' | 'copy') =>
    JSON.parse(textOf(await c.callTool({ name: 'get_component', arguments: { name, mode } })));

  it('serves extracted inputs, including host-directive and model ones', async () => {
    const avatar = await component('avatar', 'package');
    const fallback = avatar.directives.find(
      (d: { className: string }) => d.className === 'VoltAvatarFallback'
    );
    // The hand-written table used to claim `delayMs`; the source binds `delay`.
    expect(fallback.inputs.map((i: { name: string }) => i.name)).toContain('delay');
    expect(JSON.stringify(avatar)).not.toContain('delayMs');
    const sidebar = await component('sidebar', 'package');
    expect(JSON.stringify(sidebar.directives)).not.toMatch(/"name":"collapsed"/);
    const toggleGroup = await component('toggle-group', 'package');
    const outputs = toggleGroup.directives.flatMap((d: { outputs: { name: string }[] }) =>
      d.outputs.map(o => o.name)
    );
    expect(outputs).toContain('valueChange');
  });

  it('serves variants and npm packages read from the source', async () => {
    const button = await component('button', 'package');
    expect([...button.variants].sort()).toEqual([
      'destructive',
      'ghost',
      'link',
      'outline',
      'solid',
    ]);
    expect(button.sizes).toContain('icon');
    expect(button.packages).toEqual([
      'class-variance-authority',
      'clsx',
      'ng-primitives',
      'tailwind-merge',
    ]);
    const card = await component('card', 'package');
    expect(card.packages).not.toContain('ng-primitives');
    expect(card.imports).toEqual(
      expect.arrayContaining(['VoltCard', 'VoltCardHeader', 'VoltCardFooter'])
    );
  });

  it('every served component has an example and a description', async () => {
    const listed = JSON.parse(textOf(await c.callTool({ name: 'list_components', arguments: {} })));
    for (const { name } of listed) {
      const comp = await component(name);
      expect(comp.description, name).toBeTruthy();
      expect(comp.examples.length + (comp.code?.length ?? 0), name).toBeGreaterThan(0);
    }
  });

  it('generate_cli_command names the destination with --path', async () => {
    const result = JSON.parse(
      textOf(
        await c.callTool({
          name: 'generate_cli_command',
          arguments: { action: 'add', component: 'card', targetDir: './src/app/shared/ui' },
        })
      )
    );
    expect(result.command).toBe('npx @voltui/cli add card --path=./src/app/shared/ui');
  });
});

describe('advertised inventory', () => {
  let client: Client;

  beforeAll(async () => {
    const server = createMcpServer();
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'inventory-client', version: '1.0.0' }, { capabilities: {} });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('the GET discovery response is the shared inventory', async () => {
    const body = await discoveryResponse().json();
    expect(body.tools).toEqual(SERVER_INVENTORY.tools);
    expect(body.resources).toEqual(SERVER_INVENTORY.resources);
    expect(body.prompts).toEqual(SERVER_INVENTORY.prompts);
  });

  it('advertises exactly the tools the server registers (find_components included)', async () => {
    const registered = (await client.listTools()).tools.map(t => t.name).sort();
    expect(SERVER_INVENTORY.tools.map(t => t.name).sort()).toEqual(registered);
    expect(registered).toContain('find_components');
  });

  it('advertises exactly the resources and prompts the server registers', async () => {
    const templates = (await client.listResourceTemplates()).resourceTemplates.map(
      r => r.uriTemplate
    );
    const fixed = (await client.listResources()).resources
      .map(r => r.uri)
      .filter(uri => !uri.startsWith('component://'));
    expect(SERVER_INVENTORY.resources.map(r => r.uri).sort()).toEqual(
      [...templates, ...fixed].sort()
    );
    const prompts = (await client.listPrompts()).prompts.map(p => p.name).sort();
    expect(SERVER_INVENTORY.prompts.map(p => p.name).sort()).toEqual(prompts);
  });
});

describe('generate_cli_command diff', () => {
  let client: Client;
  const call = async (args: Record<string, unknown>) => {
    const result = await client.callTool({ name: 'generate_cli_command', arguments: args });
    const text = (result.content as { type: string; text: string }[])[0].text;
    return { isError: !!result.isError, body: JSON.parse(text) };
  };

  beforeAll(async () => {
    const server = createMcpServer();
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'diff-client', version: '1.0.0' }, { capabilities: {} });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('generates a read-only diff command with --path and --json', async () => {
    const { body } = await call({
      action: 'diff',
      component: 'button',
      targetDir: 'src/app/ui',
      json: true,
    });
    expect(body.command).toBe('npx @voltui/cli diff button --path=src/app/ui --json');
    expect(body.note).toMatch(/not the latest on npm/);
    expect(body.note).toMatch(/Read-only/);
  });

  it('generates add --track', async () => {
    const { body } = await call({ action: 'add', component: 'button', track: true });
    expect(body.command).toBe('npx @voltui/cli add button --track');
  });

  it('requires a component for diff and rejects flags of another action', async () => {
    expect((await call({ action: 'diff' })).isError).toBe(true);
    expect((await call({ action: 'diff', component: 'button', track: true })).isError).toBe(true);
    expect((await call({ action: 'add', component: 'button', json: true })).isError).toBe(true);
  });

  it('the generated commands parse with the real CLI parser', async () => {
    const { parseArgs } = await import('../../../../../cli/lib/args.js');
    for (const args of [
      { action: 'diff', component: 'dialog', targetDir: './src/ui', json: true },
      { action: 'add', component: 'dialog', targetDir: './src/ui', track: true },
      { action: 'init', targetDir: './src/ui' },
      { action: 'list' },
    ]) {
      const { body } = await call(args);
      const argv = body.command.replace('npx @voltui/cli ', '').split(' ');
      expect(() => parseArgs(argv)).not.toThrow();
      expect(parseArgs(argv).command).toBe(args.action);
    }
  });
});
