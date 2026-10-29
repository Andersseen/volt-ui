import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

describe('Volt Library', () => {
  const publicApiPath = resolve('packages/volt/src/public-api.ts');
  const publicApi = readFileSync(publicApiPath, 'utf-8');

  it('should export button component', () => {
    expect(publicApi).toContain("export * from './lib/components/button'");
  });

  it('should export checkbox component', () => {
    expect(publicApi).toContain("export * from './lib/components/checkbox'");
  });

  it('should export switch component', () => {
    expect(publicApi).toContain("export * from './lib/components/switch'");
  });

  it('should export card component', () => {
    expect(publicApi).toContain("export * from './lib/components/card'");
  });

  it('should export input component', () => {
    expect(publicApi).toContain("export * from './lib/components/input'");
  });

  it('should export select component', () => {
    expect(publicApi).toContain("export * from './lib/components/select'");
  });

  it('should export tabs components', () => {
    expect(publicApi).toContain("export * from './lib/components/tabs'");
  });

  it('should export theme utilities', () => {
    expect(publicApi).toContain("export * from './lib/components/theme'");
  });

  it('should export sidebar layout', () => {
    expect(publicApi).toContain("export * from './lib/layouts/sidebar'");
  });

  it('should have an index.ts barrel file for every component', () => {
    const componentsDir = resolve('packages/volt/src/lib/components');
    const entries = readdirSync(componentsDir);
    const dirs = entries.filter(entry => statSync(join(componentsDir, entry)).isDirectory());

    for (const dir of dirs) {
      const indexPath = join(componentsDir, dir, 'index.ts');
      expect(existsSync(indexPath)).toBe(true);
    }
  });

  it('should not have any .component.ts files remaining', () => {
    const componentsDir = resolve('packages/volt/src/lib/components');
    const entries = readdirSync(componentsDir);

    for (const dir of entries) {
      const dirPath = join(componentsDir, dir);
      if (!statSync(dirPath).isDirectory()) continue;
      const files = readdirSync(dirPath);
      const hasComponentSuffix = files.some(f => f.endsWith('.component.ts'));
      expect(hasComponentSuffix).toBe(false);
    }
  });

  it('should use Tailwind utilities instead of embedded critical styles for shadcn-style copy-paste', () => {
    const componentPaths = [
      'packages/volt/src/lib/components/slider/slider.ts',
      'packages/volt/src/lib/components/progress/progress.ts',
      'packages/volt/src/lib/components/switch/switch.ts',
      'packages/volt/src/lib/components/checkbox/checkbox.ts',
      'packages/volt/src/lib/components/radio/radio-item.ts',
      'packages/volt/src/lib/components/meter/meter-track.ts',
      'packages/volt/src/lib/components/meter/meter-indicator.ts',
      'packages/volt/src/lib/components/select/select.ts',
      'packages/volt/src/lib/components/select/select-content.ts',
      'packages/volt/src/lib/components/select/select-item.ts',
      'packages/volt/src/lib/components/avatar/avatar.ts',
      'packages/volt/src/lib/components/avatar/avatar-fallback.ts',
      'packages/volt/src/lib/components/separator/separator.ts',
    ];

    for (const relativePath of componentPaths) {
      const source = readFileSync(resolve(relativePath), 'utf-8');
      expect(source).not.toContain('styles:');
    }
  });
});
