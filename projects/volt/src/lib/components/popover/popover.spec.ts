import { Component } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltPopoverContent } from './popover-content';
import { VoltPopoverTrigger } from './popover-trigger';

@Component({
  selector: 'app-popover-test-wrapper',
  imports: [VoltPopoverTrigger, VoltPopoverContent],
  template: `
    <button type="button" [voltPopover]="popoverTpl">Open popover</button>

    <ng-template #popoverTpl>
      <volt-popover-content>Popover body</volt-popover-content>
    </ng-template>
  `,
})
class PopoverTestWrapper {}

describe('VoltPopoverContent', () => {
  it('should render projected popover content', async () => {
    const user = userEvent.setup();
    await render(PopoverTestWrapper);

    await user.click(screen.getByRole('button', { name: 'Open popover' }));

    expect(await screen.findByText('Popover body')).toBeInTheDocument();
  });
});
