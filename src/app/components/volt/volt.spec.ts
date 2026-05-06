import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

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

  it('should export added ng-primitives wrappers and advanced utilities', () => {
    const publicApi = readFileSync('projects/volt/src/public-api.ts', 'utf-8');
    const selectIndex = readFileSync('projects/volt/src/lib/components/select/index.ts', 'utf-8');
    const popoverIndex = readFileSync('projects/volt/src/lib/components/popover/index.ts', 'utf-8');
    const tooltipIndex = readFileSync('projects/volt/src/lib/components/tooltip/index.ts', 'utf-8');
    const dropdownIndex = readFileSync(
      'projects/volt/src/lib/components/dropdown-menu/index.ts',
      'utf-8'
    );
    const dialogIndex = readFileSync('projects/volt/src/lib/components/dialog/index.ts', 'utf-8');

    expect(publicApi).toContain('./lib/components/search');
    expect(publicApi).toContain('./lib/components/autofill');
    expect(selectIndex).toContain('VoltNativeSelect');
    expect(popoverIndex).toContain('VoltPopoverArrow');
    expect(tooltipIndex).toContain('VoltTooltipArrow');
    expect(dropdownIndex).toContain('VoltDropdownMenuSubmenuTrigger');
    expect(dialogIndex).toContain('NgpDialogManager');
  });
});
