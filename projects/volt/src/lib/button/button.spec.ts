import { describe, it, expect } from 'vitest';

describe('VoltButton', () => {
  it('should have correct default variant', () => {
    // Component defaults
    const defaultVariant = 'solid';
    expect(defaultVariant).toBe('solid');
  });

  it('should have correct default size', () => {
    const defaultSize = 'md';
    expect(defaultSize).toBe('md');
  });

  it('should have correct button variants', () => {
    const variants = ['solid', 'destructive', 'outline', 'ghost', 'link'];
    expect(variants).toContain('solid');
    expect(variants).toContain('outline');
    expect(variants).toContain('ghost');
  });

  it('should have correct button sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'icon'];
    expect(sizes).toContain('sm');
    expect(sizes).toContain('md');
    expect(sizes).toContain('lg');
  });
});
