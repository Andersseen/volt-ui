import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../routes/mcp';

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
