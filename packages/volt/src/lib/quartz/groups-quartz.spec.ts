import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { VoltRadioGroup, VoltRadioItem } from './radio';
import { VoltToggleGroup, VoltToggleGroupItem } from './toggle-group';

/*
 * What only the Quartz wrappers promise: the boundary adapters (value shape, ids) and the
 * behaviour where Quartz 0.16.0 and ng-primitives knowingly differ. The shared contract lives in
 * `testing/group-contract.ts`; these are the documented exceptions to it.
 */
describe('Quartz radio group', () => {
  const imports = [VoltRadioGroup, VoltRadioItem];

  it('mirrors Left/Right in an RTL horizontal group', async () => {
    await render(
      `<div dir="rtl"><volt-radio-group aria-label="x" orientation="horizontal" value="a">
         <volt-radio-item value="a">A</volt-radio-item>
         <volt-radio-item value="b">B</volt-radio-item>
         <volt-radio-item value="c">C</volt-radio-item>
       </volt-radio-group></div>`,
      { imports }
    );
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'B' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'A' })).toHaveFocus();
  });

  it('keeps the value when the checked item is removed, and re-checks it when it returns', async () => {
    const show = signal(true);
    const { fixture } = await render(
      `<volt-radio-group aria-label="x" value="b">
         <volt-radio-item value="a">A</volt-radio-item>
         @if (show()) { <volt-radio-item value="b">B</volt-radio-item> }
       </volt-radio-group>`,
      { imports, componentProperties: { show } }
    );
    show.set(false);
    await fixture.whenStable();
    show.set(true);
    await fixture.whenStable();
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
  });

  it('numbers ids per application, so two applications render identical ids', async () => {
    const template = `<volt-radio-group aria-label="x"><volt-radio-item value="a">A</volt-radio-item></volt-radio-group>`;
    const ids = async () => {
      const { container } = await render(template, { imports });
      const result = [...container.querySelectorAll('[id], [aria-labelledby]')].map(
        e => `${e.id}|${e.getAttribute('aria-labelledby')}`
      );
      TestBed.resetTestingModule();
      return result;
    };
    const first = await ids();
    expect(await ids()).toEqual(first);
    expect(first.join()).not.toMatch(/qz-/);
  });
});

describe('Quartz toggle group', () => {
  const imports = [VoltToggleGroup, VoltToggleGroupItem];

  it('mirrors Left/Right in an RTL group', async () => {
    await render(
      `<div dir="rtl"><volt-toggle-group aria-label="x" type="multiple">
         <volt-toggle-group-item value="a">A</volt-toggle-group-item>
         <volt-toggle-group-item value="b">B</volt-toggle-group-item>
       </volt-toggle-group></div>`,
      { imports }
    );
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
  });

  it('single mode shows at most one pressed item, even when several values are written', async () => {
    await render(
      `<volt-toggle-group aria-label="x" [value]="['a', 'b']">
         <volt-toggle-group-item value="a">A</volt-toggle-group-item>
         <volt-toggle-group-item value="b">B</volt-toggle-group-item>
       </volt-toggle-group>`,
      { imports }
    );
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'false');
  });

  it('never leaves a Quartz-generated id (a process-wide counter) on an item', async () => {
    const { container } = await render(
      `<volt-toggle-group aria-label="x"><volt-toggle-group-item value="a">A</volt-toggle-group-item></volt-toggle-group>`,
      { imports }
    );
    expect(container.querySelector('[id]')).toBeNull();
  });
});
