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

describe('VoltTooltipContent', () => {
  it('should render tooltip role and projected content', async () => {
    const user = userEvent.setup();
    await render(TooltipTestWrapper);

    await user.hover(screen.getByRole('button', { name: 'Show tooltip' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Tooltip body');
  });
});
