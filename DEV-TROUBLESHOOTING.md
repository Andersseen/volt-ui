# Development Troubleshooting

## Error 143 / esbuild Memory Issues

If you encounter the error `exit code 143` or esbuild crashes during development, this is typically due to memory constraints.

### Quick Fixes

#### Option 1: Use the optimized dev script (Recommended)
```bash
pnpm dev
```

This script automatically:
- Cleans the Angular cache
- Sets memory limits for Node.js
- Kills any existing processes on port 4200
- Uses polling for more stability

#### Option 2: Use the safe start mode
```bash
pnpm start:safe
```

This disables live reload and uses polling, which uses less memory.

#### Option 3: Manual cleanup and restart
```bash
# Clean cache
pnpm clean

# Or manually:
rm -rf .angular node_modules/.cache dist

# Start with increased memory
NODE_OPTIONS='--max-old-space-size=4096' pnpm start
```

### Prevention

1. **Regularly clean the cache**: Run `pnpm clean` periodically
2. **Close unused browser tabs**: Each tab consumes memory
3. **Use the production build for testing**: `pnpm build` uses less memory than dev server
4. **Limit file watchers**: The `.npmrc` file is already configured with memory settings

### macOS Specific

On macOS, you might need to increase system file watcher limits:

```bash
# Add to ~/.zshrc or ~/.bash_profile
export ulimit -n 65536
```

### Still Having Issues?

1. Check system memory usage: `htop` or Activity Monitor
2. Reduce the number of files being watched by excluding `node_modules` from your IDE
3. Use VS Code instead of other editors (better file watching)
4. Consider using Docker for a clean environment

### Build for Production

For production builds, use:
```bash
pnpm build:prod
```

This uses 8GB memory allocation and production optimizations.
