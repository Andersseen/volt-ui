import { Component, input, model } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltCheckbox } from './checkbox';

@Component({
  selector: 'app-checkbox-test-wrapper',
  imports: [VoltCheckbox],
  template: `<volt-checkbox [checked]="checked()" [disabled]="disabled()" [required]="required()"
    >Label</volt-checkbox
  >`,
})
class CheckboxTestWrapper {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly required = input(false);
}

describe('VoltCheckbox', () => {
  it('should render as an unchecked checkbox by default', async () => {
    await render(CheckboxTestWrapper);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should reflect the checked state', async () => {
    const { fixture } = await render(CheckboxTestWrapper, {
      componentInputs: { checked: true },
    });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    fixture.componentInstance.checked.set(false);
    fixture.detectChanges();

    expect(checkbox).not.toBeChecked();
  });

  it('should toggle checked state on click', async () => {
    const user = userEvent.setup();
    await render(CheckboxTestWrapper);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should be disabled and not clickable', async () => {
    const user = userEvent.setup();
    const changeSpy = vi.fn();

    @Component({
      selector: 'app-checkbox-disabled-wrapper',
      imports: [VoltCheckbox],
      template: `<volt-checkbox [disabled]="true" (ngpCheckboxCheckedChange)="changeSpy($event)"
        >Disabled</volt-checkbox
      >`,
    })
    class CheckboxDisabledWrapper {
      changeSpy = changeSpy;
    }

    await render(CheckboxDisabledWrapper);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);
    expect(changeSpy).not.toHaveBeenCalled();
  });
});
