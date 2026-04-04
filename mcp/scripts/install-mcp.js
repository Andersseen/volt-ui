#!/usr/bin/env node

/**
 * Volt UI MCP Installer
 * 
 * Installs MCP (Model Context Protocol) configuration for Volt UI
 * into your project for various AI editors and assistants.
 * 
 * Usage:
 *   node install-mcp.js [options]
 * 
 * Options:
 *   --editor, -e     Target editor (cursor, claude, copilot, vscode, all)
 *   --path, -p       Path to volt-ui repository
 *   --project, -j    Path to target project (default: current directory)
 *   --help, -h       Show help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showHelp() {
  console.log(`
${colors.bright}${colors.blue}Volt UI MCP Installer${colors.reset}

Installs MCP configuration for AI editors to understand Volt UI components.

${colors.bright}Usage:${colors.reset}
  node install-mcp.js [options]

${colors.bright}Options:${colors.reset}
  -e, --editor     Target editor: cursor | claude | copilot | vscode | all (default: all)
  -p, --path       Path to volt-ui repository (default: auto-detect)
  -j, --project    Path to target project (default: current directory)
  -h, --help       Show this help message

${colors.bright}Examples:${colors.reset}
  # Install all MCP configurations
  node install-mcp.js

  # Install only Cursor MCP
  node install-mcp.js -e cursor

  # Install for specific project
  node install-mcp.js -j ./my-angular-project

  # Specify volt-ui location
  node install-mcp.js -p /path/to/volt-ui -e claude
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    editor: 'all',
    voltUiPath: null,
    projectPath: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
      case '-e':
      case '--editor':
        options.editor = next;
        i++;
        break;
      case '-p':
      case '--path':
        options.voltUiPath = path.resolve(next);
        i++;
        break;
      case '-j':
      case '--project':
        options.projectPath = path.resolve(next);
        i++;
        break;
    }
  }

  return options;
}

function findVoltUiPath() {
  // Check if running from volt-ui repo
  const currentDir = process.cwd();
  const mcpDir = path.join(currentDir, 'mcp');
  
  if (fs.existsSync(mcpDir)) {
    return currentDir;
  }

  // Check parent directories
  let checkDir = currentDir;
  for (let i = 0; i < 5; i++) {
    const parentMcp = path.join(checkDir, 'mcp');
    if (fs.existsSync(parentMcp)) {
      return checkDir;
    }
    const parent = path.dirname(checkDir);
    if (parent === checkDir) break;
    checkDir = parent;
  }

  // Check environment variable
  if (process.env.VOLT_UI_PATH) {
    return process.env.VOLT_UI_PATH;
  }

  return null;
}

function installCursorMCP(voltUiPath, projectPath) {
  log('\n📁 Installing Cursor MCP...', 'blue');

  const cursorDir = path.join(projectPath, '.cursor');
  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }

  // Copy .cursorrules
  const sourceRules = path.join(voltUiPath, 'mcp/cursor/.cursorrules');
  const targetRules = path.join(projectPath, '.cursorrules');
  
  if (fs.existsSync(sourceRules)) {
    fs.copyFileSync(sourceRules, targetRules);
    log(`  ✓ Created ${path.relative(projectPath, targetRules)}`, 'green');
  }

  // Create MCP config
  const mcpConfig = {
    mcpServers: {
      'volt-ui': {
        command: 'node',
        args: [path.join(voltUiPath, 'mcp/scripts/mcp-server.js')],
        env: {
          VOLT_UI_PATH: voltUiPath
        }
      }
    }
  };

  const mcpConfigPath = path.join(cursorDir, 'mcp.json');
  fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
  log(`  ✓ Created ${path.relative(projectPath, mcpConfigPath)}`, 'green');

  return true;
}

function installClaudeMCP(voltUiPath, projectPath) {
  log('\n🧠 Installing Claude MCP...', 'blue');

  const claudeDir = path.join(projectPath, '.claude');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // Copy MCP config
  const sourceConfig = path.join(voltUiPath, 'mcp/claude/claude-mcp.json');
  const targetConfig = path.join(claudeDir, 'mcp.json');
  
  if (fs.existsSync(sourceConfig)) {
    fs.copyFileSync(sourceConfig, targetConfig);
    log(`  ✓ Created ${path.relative(projectPath, targetConfig)}`, 'green');
  }

  // Copy prompts
  const sourcePrompts = path.join(voltUiPath, 'mcp/claude/volt-prompts.md');
  const targetPrompts = path.join(claudeDir, 'volt-prompts.md');
  
  if (fs.existsSync(sourcePrompts)) {
    fs.copyFileSync(sourcePrompts, targetPrompts);
    log(`  ✓ Created ${path.relative(projectPath, targetPrompts)}`, 'green');
  }

  return true;
}

function installCopilotMCP(voltUiPath, projectPath) {
  log('\n🤖 Installing GitHub Copilot MCP...', 'blue');

  const copilotDir = path.join(projectPath, '.github');
  if (!fs.existsSync(copilotDir)) {
    fs.mkdirSync(copilotDir, { recursive: true });
  }

  // Copy instructions
  const sourceInstructions = path.join(voltUiPath, 'mcp/copilot/copilot-instructions.md');
  const targetInstructions = path.join(copilotDir, 'copilot-instructions.md');
  
  if (fs.existsSync(sourceInstructions)) {
    fs.copyFileSync(sourceInstructions, targetInstructions);
    log(`  ✓ Created ${path.relative(projectPath, targetInstructions)}`, 'green');
  }

  // Copy snippets
  const vscodeDir = path.join(projectPath, '.vscode');
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir, { recursive: true });
  }

  const sourceSnippets = path.join(voltUiPath, 'mcp/copilot/volt-snippets.json');
  const targetSnippets = path.join(vscodeDir, 'volt-snippets.code-snippets');
  
  if (fs.existsSync(sourceSnippets)) {
    fs.copyFileSync(sourceSnippets, targetSnippets);
    log(`  ✓ Created ${path.relative(projectPath, targetSnippets)}`, 'green');
  }

  return true;
}

function installVscodeMCP(voltUiPath, projectPath) {
  log('\n💻 Installing VS Code MCP...', 'blue');

  const vscodeDir = path.join(projectPath, '.vscode');
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir, { recursive: true });
  }

  // Create settings.json with Volt UI context
  const settingsPath = path.join(vscodeDir, 'settings.json');
  let settings = {};

  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch (e) {
      // Invalid JSON, start fresh
    }
  }

  // Add Volt UI to AI context
  settings['github.copilot.chat.codeGeneration.instructions'] = [
    {
      "text": "You are working with Volt UI, an Angular component library. Components use 'ui-' prefix (e.g., ui-button) and are imported from './ui/<component>'. Use standalone components with signals for reactivity."
    }
  ];

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  log(`  ✓ Updated ${path.relative(projectPath, settingsPath)}`, 'green');

  return true;
}

function createProjectContext(voltUiPath, projectPath) {
  log('\n📋 Creating project context file...', 'blue');

  const contextDir = path.join(projectPath, '.volt-ui');
  if (!fs.existsSync(contextDir)) {
    fs.mkdirSync(contextDir, { recursive: true });
  }

  // Create context file
  const context = {
    voltUiPath: voltUiPath,
    installedAt: new Date().toISOString(),
    components: [
      'button', 'badge', 'card', 'input', 'textarea',
      'checkbox', 'radio', 'switch', 'toggle', 'select',
      'tabs', 'accordion', 'avatar', 'separator', 'tooltip',
      'navigation-menu', 'form-field'
    ],
    themes: {
      colors: ['volt', 'ember', 'sage', 'dusk', 'glacier'],
      styles: ['sharp', 'soft', 'brutal', 'ghost', 'retro']
    },
    cli: {
      init: `node ${path.join(voltUiPath, 'cli/bin/volt')} init`,
      add: `node ${path.join(voltUiPath, 'cli/bin/volt')} add <component>`
    }
  };

  const contextPath = path.join(contextDir, 'context.json');
  fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
  log(`  ✓ Created ${path.relative(projectPath, contextPath)}`, 'green');

  // Copy generic context
  const genericContext = path.join(voltUiPath, 'mcp/generic/context.md');
  const targetContext = path.join(contextDir, 'context.md');
  
  if (fs.existsSync(genericContext)) {
    fs.copyFileSync(genericContext, targetContext);
    log(`  ✓ Created ${path.relative(projectPath, targetContext)}`, 'green');
  }

  return true;
}

function updatePackageJson(projectPath, voltUiPath) {
  const packagePath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    return false;
  }

  log('\n📦 Updating package.json...', 'blue');

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  // Add scripts
  if (!pkg.scripts) pkg.scripts = {};
  
  pkg.scripts['volt:add'] = `node ${path.join(voltUiPath, 'cli/bin/volt')} add`;
  pkg.scripts['volt:init'] = `node ${path.join(voltUiPath, 'cli/bin/volt')} init`;
  pkg.scripts['volt:list'] = `node ${path.join(voltUiPath, 'cli/bin/volt')} list`;

  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  log('  ✓ Added volt scripts to package.json', 'green');

  return true;
}

function main() {
  const options = parseArgs();

  log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║                Volt UI MCP Installer                       ║
║         Add AI context for Volt UI components              ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // Find volt-ui path
  const voltUiPath = options.voltUiPath || findVoltUiPath();
  
  if (!voltUiPath) {
    log('\n❌ Could not find Volt UI repository!', 'red');
    log('Please specify the path with -p or --path option', 'yellow');
    process.exit(1);
  }

  log(`\n📍 Volt UI path: ${voltUiPath}`, 'cyan');
  log(`📍 Target project: ${options.projectPath}`, 'cyan');

  const editor = options.editor.toLowerCase();
  const results = [];

  // Install based on editor selection
  if (editor === 'all' || editor === 'cursor') {
    results.push(installCursorMCP(voltUiPath, options.projectPath));
  }

  if (editor === 'all' || editor === 'claude') {
    results.push(installClaudeMCP(voltUiPath, options.projectPath));
  }

  if (editor === 'all' || editor === 'copilot') {
    results.push(installCopilotMCP(voltUiPath, options.projectPath));
  }

  if (editor === 'all' || editor === 'vscode') {
    results.push(installVscodeMCP(voltUiPath, options.projectPath));
  }

  // Create project context
  createProjectContext(voltUiPath, options.projectPath);

  // Update package.json if it exists
  updatePackageJson(options.projectPath, voltUiPath);

  log(`\n${colors.green}${colors.bright}✅ MCP installation complete!${colors.reset}\n`);

  // Show usage
  log('Next steps:', 'bright');
  log('  1. Install dependencies:', 'reset');
  log('     npm install ng-primitives class-variance-authority', 'cyan');
  log('  2. Initialize Volt UI in your project:', 'reset');
  log('     node ' + path.join(voltUiPath, 'cli/bin/volt') + ' init', 'cyan');
  log('  3. Add components:', 'reset');
  log('     node ' + path.join(voltUiPath, 'cli/bin/volt') + ' add button', 'cyan');
  log('  4. Import and use components:', 'reset');
  log('     import { UiButton } from \'./ui/button\';', 'cyan');

  log(`\n${colors.yellow}Note: Restart your editor for MCP changes to take effect.${colors.reset}\n`);
}

main();
