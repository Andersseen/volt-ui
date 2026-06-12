import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('VoltButton', () => {
  const buttonPath = resolve('projects/volt/src/lib/components/button/button.ts');
  const source = readFileSync(buttonPath, 'utf-8');

  it('should exist as a source file', () => {
    expect(source).toBeTruthy();
    expect(source.length).toBeGreaterThan(0);
  });

  it('should define buttonVariants with all expected variants', () => {
    expect(source).toContain('variant: {');
    expect(source).toContain('solid:');
    expect(source).toContain('outline:');
    expect(source).toContain('ghost:');
    expect(source).toContain('link:');
    expect(source).toContain('destructive:');
  });

  it('should define all expected sizes', () => {
    expect(source).toContain('size: {');
    expect(source).toContain('sm:');
    expect(source).toContain('md:');
    expect(source).toContain('lg:');
    expect(source).toContain('icon:');
  });

  it('should have correct selector', () => {
    expect(source).toContain("selector: 'volt-button'");
  });

  it('should use OnPush change detection', () => {
    expect(source).toContain('ChangeDetectionStrategy.OnPush');
  });

  it('should have signal inputs for variant, size and disabled', () => {
    expect(source).toContain('readonly variant = input');
    expect(source).toContain('readonly size = input');
    expect(source).toContain('readonly disabled = input');
  });

  it('should compute classes from buttonVariants', () => {
    expect(source).toContain('buttonVariants({ variant: this.variant(), size: this.size() })');
  });
});
