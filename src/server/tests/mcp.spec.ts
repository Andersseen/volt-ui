import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer, findComponents, forMode, withStreamableAccept } from '../routes/mcp';
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
    expect(beta.map((c: { name: string }) => c.name).sort()).toEqual(['empty-state', 'spinner']);
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
    expect(example.imports.npm).toBe("import { VoltButton } from '@voltui/components';");
    expect(example.imports.cli).toBe("import { UiButton } from './ui/button';");
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
    expect(forMode('<button uiButton>UI kit, Ui</button>', 'package')).toBe(
      '<button voltButton>UI kit, Ui</button>'
    );
    expect(forMode('<ui-card>', undefined)).toBe('<ui-card>');
  });
});
