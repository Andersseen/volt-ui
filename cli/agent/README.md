# @voltui/agent

Connects your AI coding agent to the [Volt UI](https://volt-ui.andersseen.dev) MCP server and
installs the Volt UI context files it needs (skill, rules, snippets) into your project.

```bash
npx @voltui/agent                  # interactive
npx @voltui/agent claude           # one agent
npx @voltui/agent cursor copilot   # several
npx @voltui/agent --all --yes      # every agent, no prompts
```

Requires Node 20 or newer. No dependencies.

## What each agent gets

| Agent      | Files written                                                                                |
| ---------- | -------------------------------------------------------------------------------------------- |
| `claude`   | `.mcp.json` (`http` transport), `.claude/skills/volt-ui/SKILL.md`                            |
| `cursor`   | `.cursor/mcp.json`, `.cursorrules`                                                           |
| `windsurf` | `.codeium/windsurf/mcp_config.json`                                                          |
| `copilot`  | `.vscode/mcp.json`, `.github/copilot-instructions.md`, `.vscode/volt-snippets.code-snippets` |
| `vscode`   | `.vscode/volt-snippets.code-snippets`                                                        |

Claude Desktop is not configured by files: add the server under Settings → Connectors.

## It will not clobber your config

Running it again is safe, and `--dry-run` shows what would change first.

- **JSON configs** are merged: your other servers and keys stay. A file that is not valid JSON
  (comments, trailing commas) is left untouched and the run fails with a message.
- **`.cursorrules`, `copilot-instructions.md`** get one block between
  `<!-- volt-ui:begin … -->` and `<!-- volt-ui:end -->`. Your own text outside it is never touched;
  the block is replaced in place on re-runs, so upgrading the package updates it.
- **Skill and snippets files** belong entirely to Volt UI and are rewritten.

## Options

| Option                             | Meaning                                                              |
| ---------------------------------- | -------------------------------------------------------------------- |
| `--all`                            | set up every agent                                                   |
| `--dir <path>`                     | project directory (default: the current directory)                   |
| `--url <url>`                      | MCP endpoint to write (default: `https://volt-ui.pages.dev/api/mcp`) |
| `--dry-run`                        | print what would change, write nothing                               |
| `--uninstall`                      | remove what this installer wrote; your other config is kept          |
| `-y`, `--yes`                      | never prompt; with no agent given, set up every agent                |
| `-v`, `--version` / `-h`, `--help` |                                                                      |

Without a terminal (CI, scripts) and without an agent or `--all`, it fails instead of waiting for input.

Exit codes: `0` ok · `1` failed (for example an unparseable config) · `2` bad usage.

## Removing it

```bash
npx @voltui/agent claude --uninstall
```

## Links

[Documentation](https://volt-ui.andersseen.dev/docs/ai-mcp) ·
[Source](https://github.com/Andersseen/volt-ui/tree/main/cli/agent) · MIT
