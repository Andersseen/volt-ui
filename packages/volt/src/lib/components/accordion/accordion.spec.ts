import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent } from './';

@Component({
  selector: 'app-accordion-test-wrapper',
  imports: [VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent],
  template: `
    <volt-accordion>
      <volt-accordion-item value="item-1">
        <volt-accordion-trigger>Item 1</volt-accordion-trigger>
        <volt-accordion-content>Content 1</volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="item-2">
        <volt-accordion-trigger>Item 2</volt-accordion-trigger>
        <volt-accordion-content>Content 2</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>
  `,
})
class AccordionTestWrapper {}

describe('VoltAccordion', () => {
  it('should render accordion triggers', async () => {
    await render(AccordionTestWrapper);

    expect(screen.getByRole('button', { name: /Item 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Item 2/i })).toBeInTheDocument();
  });

  it('should toggle aria-expanded on trigger click', async () => {
    const user = userEvent.setup();
    await render(AccordionTestWrapper);

    const trigger = screen.getByRole('button', { name: /Item 1/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus between triggers with the arrow keys, Home and End, wrapping at the ends', async () => {
    const user = userEvent.setup();
    await render(KeyboardAccordion);
    const header = (name: string) => screen.getByRole('button', { name });

    await user.tab();
    expect(header('A')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(header('B')).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(header('A')).toHaveFocus(); // wraps
    await user.keyboard('{ArrowUp}');
    expect(header('C')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(header('A')).toHaveFocus();
    await user.keyboard('{End}');
    expect(header('C')).toHaveFocus();
    // Tab order is unchanged: every trigger stays a tab stop.
    await user.tab({ shift: true });
    expect(header('B')).toHaveFocus();
  });

  it("keeps a nested accordion's triggers out of the outer one's arrow keys", async () => {
    const user = userEvent.setup();
    await render(NestedAccordion);
    const header = (name: string) => screen.getByRole('button', { name });

    await user.click(header('Outer 1'));
    await user.click(header('Inner 1'));
    await user.keyboard('{ArrowDown}');
    expect(header('Inner 2')).toHaveFocus();
    await user.click(header('Outer 1'));
    await user.keyboard('{ArrowDown}');
    expect(header('Outer 2')).toHaveFocus();
  });
});

@Component({
  selector: 'app-accordion-keyboard',
  imports: [VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent],
  template: `
    <volt-accordion>
      <volt-accordion-item value="a">
        <volt-accordion-trigger>A</volt-accordion-trigger>
        <volt-accordion-content>ca</volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="b">
        <volt-accordion-trigger>B</volt-accordion-trigger>
        <volt-accordion-content>cb</volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="c">
        <volt-accordion-trigger>C</volt-accordion-trigger>
        <volt-accordion-content>cc</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>
  `,
})
class KeyboardAccordion {}

@Component({
  selector: 'app-accordion-nested',
  imports: [VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent],
  template: `
    <volt-accordion type="multiple">
      <volt-accordion-item value="o1">
        <volt-accordion-trigger>Outer 1</volt-accordion-trigger>
        <volt-accordion-content>
          <volt-accordion type="multiple">
            <volt-accordion-item value="i1">
              <volt-accordion-trigger>Inner 1</volt-accordion-trigger>
              <volt-accordion-content>i1</volt-accordion-content>
            </volt-accordion-item>
            <volt-accordion-item value="i2">
              <volt-accordion-trigger>Inner 2</volt-accordion-trigger>
              <volt-accordion-content>i2</volt-accordion-content>
            </volt-accordion-item>
          </volt-accordion>
        </volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="o2">
        <volt-accordion-trigger>Outer 2</volt-accordion-trigger>
        <volt-accordion-content>o2</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>
  `,
})
class NestedAccordion {}
