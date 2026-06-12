import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('VoltCheckbox', () => {
  const sourcePath = resolve('projects/volt/src/lib/components/checkbox/checkbox.ts');
  const source = readFileSync(sourcePath, 'utf-8');

  it('should exist as a source file', () => {
    expect(source).toBeTruthy();
    expect(source.length).toBeGreaterThan(0);
  });

  it('should have correct selector', () => {
    expect(source).toContain("selector: 'volt-checkbox'");
  });

  it('should use OnPush change detection', () => {
    expect(source).toContain('ChangeDetectionStrategy.OnPush');
  });

  it('should have a checked model signal', () => {
    expect(source).toContain('readonly checked = model(false)');
  });

  it('should have disabled and required inputs', () => {
    expect(source).toContain('readonly disabled = input(false)');
    expect(source).toContain('readonly required = input(false)');
  });

  it('should use ng-primitives NgpCheckbox', () => {
    expect(source).toContain("import { NgpCheckbox } from 'ng-primitives/checkbox'");
    expect(source).toContain('ngpCheckbox');
  });

  it('should render a checkmark svg when checked', () => {
    expect(source).toContain('@if (checked())');
    expect(source).toContain('<svg');
    expect(source).toContain('<polyline points="20 6 9 17 4 12"></polyline>');
  });
});
