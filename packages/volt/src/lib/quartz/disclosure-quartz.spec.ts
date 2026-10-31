import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
} from './accordion';
import { VoltTabs, VoltTabsContent, VoltTabsList, VoltTabsTrigger } from './tabs';

/*
 * What only the Quartz wrappers promise: the boundary adapters (ids, value ownership) and the
 * behaviour where Quartz 0.16.0 and ng-primitives knowingly differ. The shared contract lives in
 * `testing/disclosure-contract.ts`; these are the documented exceptions to it.
 */
describe('Quartz tabs', () => {
  const imports = [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent];
  const three = (attrs = '') => `
    <volt-tabs ${attrs}>
      <volt-tabs-list aria-label="x">
        <volt-tabs-trigger value="a">A</volt-tabs-trigger>
        <volt-tabs-trigger value="b">B</volt-tabs-trigger>
        <volt-tabs-trigger value="c">C</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="a">PA</volt-tabs-content>
      <volt-tabs-content value="b">PB</volt-tabs-content>
      <volt-tabs-content value="c">PC</volt-tabs-content>
    </volt-tabs>`;
  const tab = (name: string) => screen.getByRole('tab', { name });

  it('with activateOnFocus off, Enter and Space select the focused tab', async () => {
    const changed = vi.fn();
    const user = userEvent.setup();
    await render(three('value="a" [activateOnFocus]="false" (valueChange)="changed($event)"'), {
      imports,
      componentProperties: { changed },
    });
    await user.tab();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(tab('B')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight} ');
    expect(tab('C')).toHaveAttribute('aria-selected', 'true');
    expect(changed.mock.calls).toEqual([['b'], ['c']]);
  });

  it('mirrors Left/Right in an RTL document', async () => {
    await render(`<div dir="rtl">${three('value="a"')}</div>`, { imports });
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(tab('B')).toHaveFocus();
  });

  it('never leaves a dangling aria-controls for a tab without a panel', async () => {
    const { container } = await render(
      `<volt-tabs value="a"><volt-tabs-list aria-label="x"><volt-tabs-trigger value="a">A</volt-tabs-trigger></volt-tabs-list></volt-tabs>`,
      { imports }
    );
    expect(container.querySelector('[role="tab"]')).not.toHaveAttribute('aria-controls');
  });

  it('numbers ids per application, so two applications render identical ids', async () => {
    const ids = async () => {
      const { container } = await render(three('value="a"'), { imports });
      const result = [
        ...container.querySelectorAll('[id], [aria-controls], [aria-labelledby]'),
      ].map(e => `${e.id}|${e.getAttribute('aria-controls')}|${e.getAttribute('aria-labelledby')}`);
      TestBed.resetTestingModule();
      return result;
    };
    const first = await ids();
    expect(await ids()).toEqual(first);
    expect(first.join()).not.toMatch(/qz-/);
  });

  it('shows a tab that was selected by the model when it is added later, never overwriting the model', async () => {
    const show = signal(false);
    const changed = vi.fn();
    const { fixture } = await render(
      `<volt-tabs value="late" (valueChange)="changed($event)"><volt-tabs-list aria-label="x">
         <volt-tabs-trigger value="a">A</volt-tabs-trigger>
         @if (show()) { <volt-tabs-trigger value="late">Late</volt-tabs-trigger> }
       </volt-tabs-list></volt-tabs>`,
      { imports, componentProperties: { show, changed } }
    );
    show.set(true);
    await fixture.whenStable();
    expect(tab('Late')).toHaveAttribute('aria-selected', 'true');
    expect(changed).not.toHaveBeenCalled();
  });

  it('keeps the model when the selected tab is removed (Quartz moves its own selection)', async () => {
    const show = signal(true);
    const changed = vi.fn();
    const { fixture } = await render(
      `<volt-tabs value="b" (valueChange)="changed($event)"><volt-tabs-list aria-label="x">
         <volt-tabs-trigger value="a">A</volt-tabs-trigger>
         @if (show()) { <volt-tabs-trigger value="b">B</volt-tabs-trigger> }
       </volt-tabs-list></volt-tabs>`,
      { imports, componentProperties: { show, changed } }
    );
    show.set(false);
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    expect(changed).not.toHaveBeenCalled();
    expect(tab('A')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Quartz accordion', () => {
  const imports = [VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent];
  const three = (attrs = '') => `
    <volt-accordion ${attrs}>
      <volt-accordion-item value="a"><volt-accordion-trigger>A</volt-accordion-trigger>
        <volt-accordion-content>ca</volt-accordion-content></volt-accordion-item>
      <volt-accordion-item value="b"><volt-accordion-trigger>B</volt-accordion-trigger>
        <volt-accordion-content>cb</volt-accordion-content></volt-accordion-item>
      <volt-accordion-item value="c"><volt-accordion-trigger>C</volt-accordion-trigger>
        <volt-accordion-content>cc</volt-accordion-content></volt-accordion-item>
    </volt-accordion>`;
  const header = (name: string) => screen.getByRole('button', { name });

  it('moves focus between triggers with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    await render(three(), { imports });
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(header('B')).toHaveFocus();
    await user.keyboard('{End}');
    expect(header('C')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(header('A')).toHaveFocus();
  });

  it('marks the one open item of a non-collapsible single accordion aria-disabled (it cannot close)', async () => {
    await render(three('value="a"'), { imports });
    expect(header('A')).toHaveAttribute('aria-disabled', 'true');
    expect(header('B')).not.toHaveAttribute('aria-disabled');
  });

  it('does not open the first item on its own when the value is null', async () => {
    const changed = vi.fn();
    await render(three('(valueChange)="changed($event)"'), {
      imports,
      componentProperties: { changed },
    });
    expect(header('A')).toHaveAttribute('aria-expanded', 'false');
    expect(changed).not.toHaveBeenCalled();
  });

  it('writes no hidden attribute on a closed panel: visibility is the closed state, so it can animate', async () => {
    const { container } = await render(three('value="a"'), { imports });
    for (const panel of container.querySelectorAll('volt-accordion-content')) {
      expect(panel).not.toHaveAttribute('hidden');
    }
    expect(container.querySelectorAll('volt-accordion-content[data-closed]')).toHaveLength(2);
    expect(container.querySelector('volt-accordion-content')!.className).toContain('invisible');
  });

  it('numbers ids per application, so two applications render identical ids', async () => {
    const ids = async () => {
      const { container } = await render(three('value="a"'), { imports });
      const result = [
        ...container.querySelectorAll('[id], [aria-controls], [aria-labelledby]'),
      ].map(e => `${e.id}|${e.getAttribute('aria-controls')}|${e.getAttribute('aria-labelledby')}`);
      TestBed.resetTestingModule();
      return result;
    };
    const first = await ids();
    expect(await ids()).toEqual(first);
    expect(first.join()).not.toMatch(/qz-/);
  });

  it('moves focus to a remaining trigger when the focused trigger is removed', async () => {
    const show = signal(true);
    const user = userEvent.setup();
    const { fixture } = await render(
      `<volt-accordion>
         <volt-accordion-item value="a"><volt-accordion-trigger>A</volt-accordion-trigger><volt-accordion-content>a</volt-accordion-content></volt-accordion-item>
         @if (show()) { <volt-accordion-item value="b"><volt-accordion-trigger>B</volt-accordion-trigger><volt-accordion-content>b</volt-accordion-content></volt-accordion-item> }
       </volt-accordion>`,
      { imports, componentProperties: { show } }
    );
    await user.click(header('B'));
    expect(header('B')).toHaveFocus();
    show.set(false);
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve));
    expect(header('A')).toHaveFocus();
  });
});
