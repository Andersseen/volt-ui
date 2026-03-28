import { describe, it, expect } from 'vitest';

describe('Sanity Check', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should work with numbers', () => {
    expect(1 + 1).toBe(2);
  });
});
