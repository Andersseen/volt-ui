import { Component, signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
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

@Component({
  selector: 'app-tooltip-string-wrapper',
  imports: [VoltTooltip],
  template: `<button type="button" [voltTooltip]="text()" [delay]="0">Save</button>`,
})
class TooltipStringWrapper {
  readonly text = signal('Save your changes');
}

@Component({
  selector: 'app-tooltip-static-string-wrapper',
  imports: [VoltTooltip],
  template: `<button type="button" voltTooltip="Static text" [delay]="0">Static</button>`,
})
class TooltipStaticStringWrapper {}

describe('VoltTooltip content', () => {
  let consoleError: MockInstance<typeof console.error>;
  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error');
  });
  afterEach(() => {
    // ng-primitives logs "[ngpTooltipTrigger]: Tooltip must be a string…" when content is lost.
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('shows a bound string on hover', async () => {
    const user = userEvent.setup();
    await render(TooltipStringWrapper);

    await user.hover(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Save your changes');
  });

  it('shows a static string attribute on keyboard focus and describes the trigger with it', async () => {
    const user = userEvent.setup();
    await render(TooltipStaticStringWrapper);

    await user.tab();
    const trigger = screen.getByRole('button', { name: 'Static' });
    expect(trigger).toHaveFocus();

    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Static text');
    expect(trigger).toHaveAccessibleDescription('Static text');
  });

  it('shows a TemplateRef on keyboard focus', async () => {
    const user = userEvent.setup();
    await render(TooltipTestWrapper);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Show tooltip' })).toHaveFocus();

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Tooltip body');
  });

  it('follows a string that changes after the first render', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TooltipStringWrapper);
    fixture.componentInstance.text.set('Saved');
    await fixture.whenStable();

    await user.hover(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Saved');
  });
});

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
