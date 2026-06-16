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

  it('should embed critical component styles for npm consumers that do not scan node_modules', () => {
    const criticalStyleChecks = [
      {
        path: 'projects/volt/src/lib/components/slider/slider.ts',
        snippets: ['[ngpSliderTrack]', 'height: 0.5rem', '[ngpSliderThumb]', 'height: 1.25rem'],
      },
      {
        path: 'projects/volt/src/lib/components/progress/progress.ts',
        snippets: ['[ngpProgressTrack]', 'height: 0.5rem', '[ngpProgressIndicator]'],
      },
      {
        path: 'projects/volt/src/lib/components/switch/switch.ts',
        snippets: ['[ngpSwitch]', 'height: 1.25rem', '[ngpSwitchThumb]', 'height: 1rem'],
      },
      {
        path: 'projects/volt/src/lib/components/checkbox/checkbox.ts',
        snippets: ['[ngpCheckbox]', 'height: 1rem', 'width: 1rem'],
      },
      {
        path: 'projects/volt/src/lib/components/radio/radio-item.ts',
        snippets: ['[ngpRadioItem]', 'height: 1rem', '[ngpRadioIndicator] > span'],
      },
      {
        path: 'projects/volt/src/lib/components/meter/meter-track.ts',
        snippets: [':host', 'height: 0.5rem', 'width: 100%'],
      },
      {
        path: 'projects/volt/src/lib/components/meter/meter-indicator.ts',
        snippets: [':host', 'height: 100%', 'background: var(--primary'],
      },
    ];

    for (const check of criticalStyleChecks) {
      const source = readFileSync(resolve(check.path), 'utf-8');
      expect(source).toContain('styles:');

      for (const snippet of check.snippets) {
        expect(source).toContain(snippet);
      }
    }
  });
});
