import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('VoltButton', () => {
  const buttonPath = resolve('projects/volt/src/lib/components/button/button.ts');
  const variantsPath = resolve('projects/volt/src/lib/components/button/variants.ts');
  const source = readFileSync(buttonPath, 'utf-8');
  const variantsSource = readFileSync(variantsPath, 'utf-8');

  it('should exist as a source file', () => {
    expect(source).toBeTruthy();
    expect(source.length).toBeGreaterThan(0);
  });

  it('should define buttonVariants with all expected variants', () => {
    expect(variantsSource).toContain('variant: {');
    expect(variantsSource).toContain('solid:');
    expect(variantsSource).toContain('outline:');
    expect(variantsSource).toContain('ghost:');
    expect(variantsSource).toContain('link:');
    expect(variantsSource).toContain('destructive:');
  });

  it('should define all expected sizes', () => {
    expect(variantsSource).toContain('size: {');
    expect(variantsSource).toContain('sm:');
    expect(variantsSource).toContain('md:');
    expect(variantsSource).toContain('lg:');
    expect(variantsSource).toContain('icon:');
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
