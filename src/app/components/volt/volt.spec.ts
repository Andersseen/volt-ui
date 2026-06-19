import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

describe('Volt Library', () => {
  const publicApiPath = resolve('projects/volt/src/public-api.ts');
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
    const componentsDir = resolve('projects/volt/src/lib/components');
    const entries = readdirSync(componentsDir);
    const dirs = entries.filter(entry => statSync(join(componentsDir, entry)).isDirectory());

    for (const dir of dirs) {
      const indexPath = join(componentsDir, dir, 'index.ts');
      expect(existsSync(indexPath)).toBe(true);
    }
  });

  it('should not have any .component.ts files remaining', () => {
    const componentsDir = resolve('projects/volt/src/lib/components');
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
      'projects/volt/src/lib/components/slider/slider.ts',
      'projects/volt/src/lib/components/progress/progress.ts',
      'projects/volt/src/lib/components/switch/switch.ts',
      'projects/volt/src/lib/components/checkbox/checkbox.ts',
      'projects/volt/src/lib/components/radio/radio-item.ts',
      'projects/volt/src/lib/components/meter/meter-track.ts',
      'projects/volt/src/lib/components/meter/meter-indicator.ts',
      'projects/volt/src/lib/components/select/select.ts',
      'projects/volt/src/lib/components/select/select-content.ts',
      'projects/volt/src/lib/components/select/select-item.ts',
      'projects/volt/src/lib/components/avatar/avatar.ts',
      'projects/volt/src/lib/components/avatar/avatar-fallback.ts',
      'projects/volt/src/lib/components/separator/separator.ts',
    ];

    for (const relativePath of componentPaths) {
      const source = readFileSync(resolve(relativePath), 'utf-8');
      expect(source).not.toContain('styles:');
    }
  });
});
