import { Component } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltTooltip } from './tooltip';
import { VoltTooltipContent } from './tooltip-content';

@Component({
  selector: 'app-tooltip-test-wrapper',
  imports: [VoltTooltip, VoltTooltipContent],
  template: `
    <button type="button" voltTooltip [voltTooltip]="tooltipTpl" [delay]="0">Show tooltip</button>

    <ng-template #tooltipTpl>
      <volt-tooltip-content>Tooltip body</volt-tooltip-content>
    </ng-template>
  `,
})
class TooltipTestWrapper {}

@Component({
  selector: 'app-tooltip-default-wrapper',
  imports: [VoltTooltip, VoltTooltipContent],
  template: `
    <button type="button" [voltTooltip]="tooltipTpl">Default delay</button>

    <ng-template #tooltipTpl>
      <volt-tooltip-content>Delayed body</volt-tooltip-content>
    </ng-template>
  `,
})
class TooltipDefaultWrapper {}

describe('VoltTooltipContent', () => {
  it('should render tooltip role and projected content', async () => {
    const user = userEvent.setup();
    await render(TooltipTestWrapper);

    await user.hover(screen.getByRole('button', { name: 'Show tooltip' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Tooltip body');
  });

  it('waits the documented 300ms before showing when `delay` is not bound', async () => {
    const user = userEvent.setup();
    await render(TooltipDefaultWrapper);

    await user.hover(screen.getByRole('button', { name: 'Default delay' }));

    // The primitive's own default is 0ms: unbound, the tooltip used to appear at once.
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(await screen.findByRole('tooltip', undefined, { timeout: 2000 })).toHaveTextContent(
      'Delayed body'
    );
  });
});
