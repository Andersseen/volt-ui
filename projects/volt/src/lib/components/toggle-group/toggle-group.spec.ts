import { Component, input, model } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltToggleGroup } from './toggle-group';
import { VoltToggleGroupItem } from './toggle-group-item';

@Component({
  selector: 'app-toggle-group-test-wrapper',
  imports: [VoltToggleGroup, VoltToggleGroupItem],
  template: `
    <volt-toggle-group
      [(value)]="value"
      [type]="type()"
      [disabled]="disabled()"
      [allowDeselection]="allowDeselection()"
    >
      <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
      <volt-toggle-group-item value="italic" [disabled]="itemDisabled()"
        >Italic</volt-toggle-group-item
      >
      <volt-toggle-group-item value="underline">Underline</volt-toggle-group-item>
    </volt-toggle-group>
  `,
})
class ToggleGroupTestWrapper {
  readonly value = model<string[]>([]);
  readonly type = input<'single' | 'multiple'>('single');
  readonly disabled = input(false);
  readonly allowDeselection = input(true);
  readonly itemDisabled = input(false);
}

describe('VoltToggleGroup', () => {
  it('should select an item on click in single mode', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper);

    const bold = screen.getByRole('radio', { name: /Bold/i });
    expect(bold).not.toHaveAttribute('data-selected');

    await user.click(bold);
    expect(bold).toHaveAttribute('data-selected');
    expect(fixture.componentInstance.value()).toEqual(['bold']);
  });

  it('should allow multiple selections in multiple mode', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, {
      componentInputs: { type: 'multiple' },
    });

    const bold = screen.getByRole('radio', { name: /Bold/i });
    const italic = screen.getByRole('radio', { name: /Italic/i });

    await user.click(bold);
    await user.click(italic);

    expect(fixture.componentInstance.value()).toEqual(['bold', 'italic']);
  });

  it('should deselect when allowDeselection is true', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, {
      componentInputs: { value: ['bold'] },
    });

    const bold = screen.getByRole('radio', { name: /Bold/i });
    expect(bold).toHaveAttribute('data-selected');

    await user.click(bold);
    expect(bold).not.toHaveAttribute('data-selected');
    expect(fixture.componentInstance.value()).toEqual([]);
  });

  it('should not deselect when allowDeselection is false', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, {
      componentInputs: { value: ['bold'], allowDeselection: false },
    });

    const bold = screen.getByRole('radio', { name: /Bold/i });
    await user.click(bold);

    expect(bold).toHaveAttribute('data-selected');
    expect(fixture.componentInstance.value()).toEqual(['bold']);
  });

  it('should not select a disabled item', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ToggleGroupTestWrapper, {
      componentInputs: { itemDisabled: true },
    });

    const italic = screen.getByRole('radio', { name: /Italic/i });
    expect(italic).toHaveAttribute('aria-disabled', 'true');

    await user.click(italic);
    expect(fixture.componentInstance.value()).toEqual([]);
  });

  it('should move focus with arrow keys', async () => {
    const user = userEvent.setup();
    await render(ToggleGroupTestWrapper);

    const bold = screen.getByRole('radio', { name: /Bold/i });
    const italic = screen.getByRole('radio', { name: /Italic/i });

    await user.click(bold);
    await user.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(italic);
  });
});
