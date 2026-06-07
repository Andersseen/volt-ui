import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('VoltSwitch', () => {
  const sourcePath = resolve('projects/volt/src/lib/components/switch/switch.ts');
  const source = readFileSync(sourcePath, 'utf-8');

  it('should exist as a source file', () => {
    expect(source).toBeTruthy();
    expect(source.length).toBeGreaterThan(0);
  });

  it('should have correct selector', () => {
    expect(source).toContain("selector: 'volt-switch'");
  });

  it('should use OnPush change detection', () => {
    expect(source).toContain('ChangeDetectionStrategy.OnPush');
  });

  it('should have checked model and disabled input', () => {
    expect(source).toContain('readonly checked = model(false)');
    expect(source).toContain('readonly disabled = input(false)');
  });

  it('should use ng-primitives NgpSwitch', () => {
    expect(source).toContain("from 'ng-primitives/switch'");
    expect(source).toContain('NgpSwitch');
    expect(source).toContain('ngpSwitch');
  });
});
