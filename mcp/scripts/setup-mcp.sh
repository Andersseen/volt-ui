#!/bin/bash

# Volt UI MCP Setup Script
# 
# This script sets up MCP (Model Context Protocol) configuration for Volt UI
# in your project. It supports multiple editors and AI assistants.
#
# Usage:
#   ./setup-mcp.sh [options]
#
# Options:
#   -e, --editor     Target editor (cursor, claude, copilot, vscode, all)
#   -p, --path       Path to volt-ui repository
#   -j, --project    Path to target project (default: current directory)
#   -h, --help       Show help

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Default values
EDITOR="all"
VOLT_UI_PATH=""
PROJECT_PATH="$(pwd)"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--editor)
      EDITOR="$2"
      shift 2
      ;;
    -p|--path)
      VOLT_UI_PATH="$2"
      shift 2
      ;;
    -j|--project)
      PROJECT_PATH="$2"
      shift 2
      ;;
    -h|--help)
      echo ""
      echo -e "${BOLD}${BLUE}Volt UI MCP Setup Script${NC}"
      echo ""
      echo "Installs MCP configuration for AI editors to understand Volt UI components."
      echo ""
      echo -e "${BOLD}Usage:${NC}"
      echo "  ./setup-mcp.sh [options]"
      echo ""
      echo -e "${BOLD}Options:${NC}"
      echo "  -e, --editor     Target editor: cursor | claude | copilot | vscode | all (default: all)"
      echo "  -p, --path       Path to volt-ui repository (default: auto-detect)"
      echo "  -j, --project    Path to target project (default: current directory)"
      echo "  -h, --help       Show this help message"
      echo ""
      echo -e "${BOLD}Examples:${NC}"
      echo "  # Install all MCP configurations"
      echo "  ./setup-mcp.sh"
      echo ""
      echo "  # Install only Cursor MCP"
      echo "  ./setup-mcp.sh -e cursor"
      echo ""
      echo "  # Install for specific project"
      echo "  ./setup-mcp.sh -j ./my-angular-project"
      echo ""
      echo "  # Specify volt-ui location"
      echo "  ./setup-mcp.sh -p /path/to/volt-ui -e claude"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo ""
echo -e "${CYAN}${BOLD}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                Volt UI MCP Setup                           ║"
echo "║         Add AI context for Volt UI components              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Find volt-ui path if not provided
if [ -z "$VOLT_UI_PATH" ]; then
  # Check if running from volt-ui repo
  if [ -d "./mcp" ]; then
    VOLT_UI_PATH="$(pwd)"
  else
    # Check parent directories
    CHECK_DIR="$(pwd)"
    for i in {1..5}; do
      if [ -d "$CHECK_DIR/mcp" ]; then
        VOLT_UI_PATH="$CHECK_DIR"
        break
      fi
      PARENT="$(dirname "$CHECK_DIR")"
      if [ "$PARENT" = "$CHECK_DIR" ]; then
        break
      fi
      CHECK_DIR="$PARENT"
    done
  fi
  
  # Check environment variable
  if [ -z "$VOLT_UI_PATH" ] && [ -n "$VOLT_UI_PATH" ]; then
    VOLT_UI_PATH="$VOLT_UI_PATH"
  fi
fi

if [ -z "$VOLT_UI_PATH" ]; then
  echo -e "${RED}❌ Could not find Volt UI repository!${NC}"
  echo -e "${YELLOW}Please specify the path with -p or --path option${NC}"
  exit 1
fi

echo -e "${BLUE}📍 Volt UI path:${NC} $VOLT_UI_PATH"
echo -e "${BLUE}📍 Target project:${NC} $PROJECT_PATH"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed!${NC}"
  echo -e "${YELLOW}Please install Node.js to use the MCP installer${NC}"
  exit 1
fi

# Run the Node.js installer
INSTALLER_PATH="$VOLT_UI_PATH/mcp/scripts/install-mcp.js"

if [ ! -f "$INSTALLER_PATH" ]; then
  echo -e "${RED}❌ Installer not found at $INSTALLER_PATH${NC}"
  exit 1
fi

node "$INSTALLER_PATH" --editor "$EDITOR" --path "$VOLT_UI_PATH" --project "$PROJECT_PATH"

echo ""
echo -e "${GREEN}${BOLD}🎉 Setup complete!${NC}"
echo ""
echo -e "${BOLD}Quick start:${NC}"
echo ""
echo -e "  ${CYAN}1. Install dependencies:${NC}"
echo -e "     npm install ng-primitives class-variance-authority"
echo ""
echo -e "  ${CYAN}2. Initialize Volt UI:${NC}"
echo -e "     node $VOLT_UI_PATH/cli/bin/volt init"
echo ""
echo -e "  ${CYAN}3. Add a component:${NC}"
echo -e "     node $VOLT_UI_PATH/cli/bin/volt add button"
echo ""
echo -e "  ${CYAN}4. Use in your component:${NC}"
echo -e "     import { UiButton } from './ui/button';"
echo ""
