import { Component, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltSwitch } from './switch';

@Component({
  selector: 'app-switch-test-wrapper',
  imports: [VoltSwitch],
  template: `<volt-switch [checked]="checked()" [disabled]="disabled()">Label</volt-switch>`,
})
class SwitchTestWrapper {
  readonly checked = model(false);
  readonly disabled = input(false);
}

describe('VoltSwitch', () => {
  it('should render as an unchecked switch by default', async () => {
    await render(SwitchTestWrapper);

    const switchButton = screen.getByRole('switch');
    expect(switchButton).toHaveAttribute('aria-checked', 'false');
  });

  it('should reflect the checked state', async () => {
    await render(SwitchTestWrapper, {
      componentInputs: { checked: true },
    });

    const switchButton = screen.getByRole('switch');
    expect(switchButton).toHaveAttribute('aria-checked', 'true');
  });

  it('should toggle checked state on click', async () => {
    const user = userEvent.setup();
    await render(SwitchTestWrapper);

    const switchButton = screen.getByRole('switch');
    expect(switchButton).toHaveAttribute('aria-checked', 'false');

    await user.click(switchButton);
    expect(switchButton).toHaveAttribute('aria-checked', 'true');

    await user.click(switchButton);
    expect(switchButton).toHaveAttribute('aria-checked', 'false');
  });

  it('should be disabled and not clickable', async () => {
    const user = userEvent.setup();
    await render(SwitchTestWrapper, {
      componentInputs: { disabled: true },
    });

    const switchButton = screen.getByRole('switch');
    expect(switchButton).toBeDisabled();

    await user.click(switchButton);
    expect(switchButton).toHaveAttribute('aria-checked', 'false');
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-switch-form-wrapper',
      imports: [ReactiveFormsModule, VoltSwitch],
      template: `<volt-switch [formControl]="control">Notifications</volt-switch>`,
    })
    class SwitchFormWrapper {
      control = new FormControl(false, { nonNullable: true });
    }

    const { fixture } = await render(SwitchFormWrapper);
    const switchButton = screen.getByRole('switch');

    await user.click(switchButton);
    expect(fixture.componentInstance.control.value).toBe(true);

    fixture.componentInstance.control.setValue(false);
    fixture.detectChanges();
    expect(switchButton).toHaveAttribute('aria-checked', 'false');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(switchButton).toBeDisabled();

    await user.click(switchButton);
    expect(fixture.componentInstance.control.value).toBe(false);
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-switch-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltSwitch],
      template: `<volt-switch [formControl]="control">Notifications</volt-switch>`,
    })
    class SwitchInvalidWrapper {
      control = new FormControl(false, {
        nonNullable: true,
        validators: Validators.requiredTrue,
      });
    }

    const { fixture } = await render(SwitchInvalidWrapper);
    const switchButton = screen.getByRole('switch');

    expect(switchButton).not.toHaveAttribute('aria-invalid');

    await user.tab();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(switchButton).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-switch-ng-model-wrapper',
      imports: [FormsModule, VoltSwitch],
      template: `<volt-switch [(ngModel)]="enabled">Notifications</volt-switch>`,
    })
    class SwitchNgModelWrapper {
      enabled = false;
    }

    const { fixture } = await render(SwitchNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const switchButton = screen.getByRole('switch');

    expect(switchButton).toHaveAttribute('aria-checked', 'false');

    await user.click(switchButton);

    expect(fixture.componentInstance.enabled).toBe(true);
  });
});
