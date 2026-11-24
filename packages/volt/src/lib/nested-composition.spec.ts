import { Component, model, signal } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltTabs, VoltTabsContent, VoltTabsList, VoltTabsTrigger } from './components/tabs';
import { VoltToggleGroup, VoltToggleGroupItem } from './components/toggle-group';
import { VoltToolbar, VoltToolbarButton } from './components/toolbar';

/*
 * Roving-focus ownership of the default backend beyond the shared contract
 * (`testing/composition-contract.ts`, run on both engines): the toolbar, which has no Quartz
 * implementation, and right-to-left through the CDK `Directionality` the primitives read.
 */

const TABS = [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent];

@Component({
  selector: 'app-toolbar-compositions',
  imports: [...TABS, VoltToolbar, VoltToolbarButton, VoltToggleGroup, VoltToggleGroupItem],
  template: `
    <volt-toolbar aria-label="Formatting">
      <button voltToolbarButton type="button">Undo</button>
      <volt-toggle-group aria-label="Align" [(value)]="align">
        <volt-toggle-group-item value="left">Left</volt-toggle-group-item>
        <volt-toggle-group-item value="right">Right</volt-toggle-group-item>
      </volt-toggle-group>
      <button voltToolbarButton type="button">Save</button>
    </volt-toolbar>
    <volt-tabs value="edit">
      <volt-tabs-list>
        <volt-tabs-trigger value="edit">Edit</volt-tabs-trigger>
        <volt-tabs-trigger value="preview">Preview</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="edit">
        <volt-toolbar aria-label="Editor">
          <button voltToolbarButton type="button">Cut</button>
          <button voltToolbarButton type="button">Paste</button>
        </volt-toolbar>
      </volt-tabs-content>
      <volt-tabs-content value="preview">Preview panel</volt-tabs-content>
    </volt-tabs>
  `,
})
class ToolbarCompositions {
  readonly align = model<string[]>([]);
}

@Component({
  selector: 'app-rtl-gallery',
  imports: [...TABS, VoltToggleGroup, VoltToggleGroupItem],
  template: `
    <volt-tabs value="photos">
      <volt-tabs-list>
        <volt-tabs-trigger value="photos">Photos</volt-tabs-trigger>
        <volt-tabs-trigger value="videos">Videos</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="photos">
        <volt-toggle-group aria-label="Thumbnail">
          <volt-toggle-group-item value="one">One</volt-toggle-group-item>
          <volt-toggle-group-item value="two">Two</volt-toggle-group-item>
        </volt-toggle-group>
      </volt-tabs-content>
      <volt-tabs-content value="videos">Videos panel</volt-tabs-content>
    </volt-tabs>
  `,
})
class RtlGallery {}

describe('nested composites own their roving focus (ng-primitives)', () => {
  it('a toggle group in a toolbar joins its single tab stop and its arrow keys', async () => {
    const user = userEvent.setup();
    await render(ToolbarCompositions);
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Left' })).toHaveAttribute('tabindex', '-1');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Left' }));
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save' }));
  });

  it('a toolbar in a tab panel keeps its own tab stop and stays out of the tab list', async () => {
    const user = userEvent.setup();
    await render(ToolbarCompositions);
    expect(screen.getByRole('button', { name: 'Cut' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Edit' })).toHaveAttribute('tabindex', '0');
    await user.click(screen.getByRole('button', { name: 'Cut' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Paste' }));
    await user.click(screen.getByRole('tab', { name: 'Edit' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Preview' }));
  });

  it('right-to-left: ArrowLeft moves forward inside a toggle group in a tab panel', async () => {
    const user = userEvent.setup();
    await render(RtlGallery, {
      providers: [{ provide: Directionality, useValue: { value: 'rtl', change: signal('rtl') } }],
    });
    await user.click(screen.getByRole('radio', { name: 'One' }));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Two' }));
    expect(screen.getByRole('tab', { name: 'Photos' })).toHaveAttribute('aria-selected', 'true');
  });
});
