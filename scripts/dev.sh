#!/bin/bash

# Development server script with memory optimization
# Usage: ./scripts/dev.sh

echo "Starting Volt UI dev server..."

# Clean cache
rm -rf dist

# Kill any existing process on port 4200
lsof -ti:4200 | xargs kill -9 2>/dev/null || true

# Start vite dev server
export NODE_OPTIONS="--max-old-space-size=4096"
npx vite --host 0.0.0.0 --port 4200
