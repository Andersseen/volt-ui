'use strict';

/**
 * The Volt UI agent skills, read from `cli/agent/skills/<name>/SKILL.md` — the one copy. The
 * installer writes them for agents that load skills (Claude Code, Codex, OpenCode); for agents that
 * only read a rules file it writes `routingBlock()`, built from the same files, so a rules file and
 * a skill cannot say different things.
 *
 * Each SKILL.md carries a `<!-- volt:digest:start/end -->` section: the few rules an agent needs when
 * it cannot load the skill itself.
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, 'skills');
const DIGEST = /<!-- volt:digest:start -->\n([\s\S]*?)\n<!-- volt:digest:end -->/;

/** `volt-ui` first (the router), then the rest alphabetically. */
function skillNames() {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map(d => d.name)
    .sort((a, b) => (a === 'volt-ui' ? -1 : b === 'volt-ui' ? 1 : a.localeCompare(b)));
}

/** @returns {Record<string, string>} skill name → full SKILL.md text */
function loadSkills() {
  return Object.fromEntries(
    skillNames().map(n => [n, fs.readFileSync(path.join(SKILLS_DIR, n, 'SKILL.md'), 'utf8')])
  );
}

/** Name and (folded) description from the YAML frontmatter. */
function describe(text) {
  const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const name = front.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? '';
  const desc = front.match(/^description:\s*>?\s*\n?([\s\S]*)$/m)?.[1] ?? '';
  const description = desc
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join(' ');
  return { name, description };
}

function digestOf(text) {
  return text.match(DIGEST)?.[1]?.trim() ?? '';
}

/**
 * The block for agents that read a rules file but do not load skills. Short on purpose: the
 * facts live in the MCP server, the decisions in the digests below.
 */
function routingBlock(mcpUrl) {
  const skills = loadSkills();
  const sections = Object.entries(skills)
    .filter(([name]) => name !== 'volt-ui')
    .map(([name, text]) => `### ${name.replace('volt-ui-', '')}\n${digestOf(text)}`)
    .join('\n\n');
  return `# Volt UI (Angular)

${digestOf(skills['volt-ui'])}

MCP server \`volt-ui\` (${mcpUrl}): \`list_components\`, \`find_components\`, \`get_component\`, \`get_usage_example\`, \`get_theme_info\`, \`generate_cli_command\`.

## Playbooks

${sections}
`;
}

module.exports = { SKILLS_DIR, skillNames, loadSkills, describe, digestOf, routingBlock };
