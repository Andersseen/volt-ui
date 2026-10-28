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
});
