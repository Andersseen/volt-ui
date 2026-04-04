#!/bin/bash

# Development server script with memory optimization
# Usage: ./scripts/dev.sh

echo "🚀 Starting Volt UI dev server with optimized memory settings..."

# Clean cache
rm -rf .angular/cache dist

# Set memory limit and start dev server
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=256"
export NG_BUILD_PARALLELISM=2

# Kill any existing Angular processes on port 4200
lsof -ti:4200 | xargs kill -9 2>/dev/null || true

# Start dev server with polling for more stability
npx ng serve --host 0.0.0.0 --port 4200 --poll 1000
