import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltListbox,
  VoltListboxOption,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSlider,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltToggleGroup,
  VoltToggleGroupItem,
  VoltToggle,
} from '../public-api';

/**
 * Contract: a component given a *static* initial value must stay interactive.
 *
 * ng-primitives latches a primitive into controlled mode the first time its value input is
 * defined. A Volt wrapper that forwarded `value` straight to it froze on `value="a"` — a click
 * emitted but nothing changed — while every existing spec stayed green, because they all bound
 * `[(value)]` or a form control, where the parent writes the value back. This is the case those
 * specs never exercised: the one a docs page or a consumer writes first.
 */
describe('static initial value stays interactive', () => {
  it('radio', async () => {
    await render(
      `<volt-radio-group value="a"><volt-radio-item value="a">A</volt-radio-item><volt-radio-item value="b">B</volt-radio-item></volt-radio-group>`,
      { imports: [VoltRadioGroup, VoltRadioItem] }
    );
    await userEvent.setup().click(screen.getByRole('radio', { name: 'B' }));
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
  });
  it('tabs', async () => {
    await render(
      `<volt-tabs value="a"><volt-tabs-list><volt-tabs-trigger value="a">A</volt-tabs-trigger><volt-tabs-trigger value="b">B</volt-tabs-trigger></volt-tabs-list><volt-tabs-content value="a">PA</volt-tabs-content><volt-tabs-content value="b">PB</volt-tabs-content></volt-tabs>`,
      { imports: [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent] }
    );
    await userEvent.setup().click(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
  });
  it('toggle-group', async () => {
    await render(
      `<volt-toggle-group [value]="['a']"><volt-toggle-group-item value="a">A</volt-toggle-group-item><volt-toggle-group-item value="b">B</volt-toggle-group-item></volt-toggle-group>`,
      { imports: [VoltToggleGroup, VoltToggleGroupItem] }
    );
    await userEvent.setup().click(screen.getByRole('radio', { name: 'B' }));
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
  });
  it('listbox', async () => {
    await render(
      `<volt-listbox [value]="['a']" aria-label="L"><volt-listbox-option value="a">A</volt-listbox-option><volt-listbox-option value="b">B</volt-listbox-option></volt-listbox>`,
      { imports: [VoltListbox, VoltListboxOption] }
    );
    await userEvent.setup().click(screen.getByRole('option', { name: 'B' }));
    expect(screen.getByRole('option', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
  });
  it('accordion', async () => {
    await render(
      `<volt-accordion value="a"><volt-accordion-item value="a"><volt-accordion-trigger>A</volt-accordion-trigger><volt-accordion-content>CA</volt-accordion-content></volt-accordion-item><volt-accordion-item value="b"><volt-accordion-trigger>B</volt-accordion-trigger><volt-accordion-content>CB</volt-accordion-content></volt-accordion-item></volt-accordion>`,
      { imports: [VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent] }
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-expanded', 'true');
  });
  it('slider', async () => {
    await render(`<volt-slider [value]="40" ariaLabel="S" />`, { imports: [VoltSlider] });
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(thumb).not.toHaveAttribute('aria-valuenow', '40');
  });
  it('toggle with a static pressed state', async () => {
    await render(`<volt-toggle [pressed]="true" aria-label="T">T</volt-toggle>`, {
      imports: [VoltToggle],
    });
    await userEvent.setup().click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
