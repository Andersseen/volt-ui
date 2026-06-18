import { Component, model } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltTabs } from './tabs';
import { VoltTabsList } from './tabs-list';
import { VoltTabsTrigger } from './tabs-trigger';
import { VoltTabsContent } from './tabs-content';

@Component({
  selector: 'app-tabs-test-wrapper',
  imports: [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent],
  template: `
    <volt-tabs [(value)]="value">
      <volt-tabs-list>
        <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
        <volt-tabs-trigger value="security">Security</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="account">Account content</volt-tabs-content>
      <volt-tabs-content value="security">Security content</volt-tabs-content>
    </volt-tabs>
  `,
})
class TabsTestWrapper {
  readonly value = model('account');
}

describe('VoltTabs', () => {
  it('should render tab triggers', async () => {
    await render(TabsTestWrapper);

    expect(screen.getByRole('tab', { name: /Account/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Security/i })).toBeInTheDocument();
  });

  it('should display the active tab panel by default', async () => {
    const { container } = await render(TabsTestWrapper);

    const accountPanel = container.querySelector('volt-tabs-content[value="account"]');
    const securityPanel = container.querySelector('volt-tabs-content[value="security"]');

    expect(accountPanel).toHaveAttribute('data-state', 'active');
    expect(securityPanel).toHaveAttribute('data-state', 'inactive');
  });

  it('should switch tab panel on trigger click', async () => {
    const user = userEvent.setup();
    const { container } = await render(TabsTestWrapper);

    await user.click(screen.getByRole('tab', { name: /Security/i }));

    const accountPanel = container.querySelector('volt-tabs-content[value="account"]');
    const securityPanel = container.querySelector('volt-tabs-content[value="security"]');

    expect(accountPanel).toHaveAttribute('data-state', 'inactive');
    expect(securityPanel).toHaveAttribute('data-state', 'active');
  });
});
