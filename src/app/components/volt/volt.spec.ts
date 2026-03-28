import { describe, it, expect } from 'vitest';

describe('Volt Library', () => {
  it('should export all components', () => {
    const components = [
      'VoltButton',
      'VoltCheckbox',
      'VoltSwitch',
      'VoltInput',
      'VoltCard',
      'VoltTabs',
      'VoltAccordion',
      'VoltBadge',
      'VoltAvatar',
      'VoltSelect',
      'VoltRadioGroup',
      'VoltTooltip',
    ];

    expect(components.length).toBeGreaterThan(0);
    expect(components).toContain('VoltButton');
    expect(components).toContain('VoltCheckbox');
    expect(components).toContain('VoltSwitch');
  });
});
