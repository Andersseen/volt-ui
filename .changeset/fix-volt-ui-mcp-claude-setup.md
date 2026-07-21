---
'volt-ui-mcp': minor
---

Fix Claude Code integration and de-duplicate the installer:

- The `claude` target now writes the project-level MCP config to `.mcp.json` at the consumer's repo root using the `http` transport type, matching how Claude Code actually reads remote MCP servers (previously wrote `.claude/mcp.json` with an invalid `"type": "url"`).
- The `claude` target now also installs the Volt UI skill at `.claude/skills/volt-ui/SKILL.md` in the consumer project, so Claude Code auto-discovers it. Previously the skill was never distributed to consumers at all.
- Dropped the unreliable auto-patch of `claude_desktop_config.json` (remote MCP servers aren't configured that way in Claude Desktop); replaced with guidance to use Settings → Connectors.
- Removed the duplicate `cli/setup-mcp.js` copy — `cli/mcp/setup-mcp.js` is now the single source published as `volt-ui-mcp`.
- Fixed a pre-existing gap where the `autofill` component was missing from the Cursor rules and Copilot instructions content.
