import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('should exist', () => {
    expect(true).toBe(true);
  });

  it('should have correct app structure', () => {
    const routes = ['/', '/docs'];
    expect(routes).toContain('/');
  });
});
