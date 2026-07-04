import { Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltToggle } from './toggle';

@Component({
  selector: 'app-toggle-test-wrapper',
  imports: [VoltToggle],
  template: `<volt-toggle [variant]="variant()" [size]="size()" [disabled]="disabled()"
    >Bold</volt-toggle
  >`,
})
class ToggleTestWrapper {
  readonly variant = input<'default' | 'outline' | 'ghost' | 'solid'>('default');
  readonly size = input<'sm' | 'md' | 'lg' | 'icon'>('md');
  readonly disabled = input(false);
}

@Component({
  selector: 'app-toggle-form-wrapper',
  imports: [VoltToggle],
  template: `<volt-toggle (pressedChange)="onChange($event)">Italic</volt-toggle>`,
})
class ToggleFormWrapper {
  onChange = vi.fn();
}

describe('VoltToggle', () => {
  it('should render toggle button', async () => {
    await render(ToggleTestWrapper);

    expect(screen.getByRole('button', { name: /Bold/i })).toBeInTheDocument();
  });

  it('should toggle pressed state on click', async () => {
    const user = userEvent.setup();
    await render(ToggleFormWrapper);

    const button = screen.getByRole('button', { name: /Italic/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should be disabled and not clickable', async () => {
    const user = userEvent.setup();
    const changeSpy = vi.fn();

    @Component({
      selector: 'app-toggle-disabled-wrapper',
      imports: [VoltToggle],
      template: `<volt-toggle [disabled]="true" (pressedChange)="onChange($event)"
        >Strike</volt-toggle
      >`,
    })
    class ToggleDisabledWrapper {
      onChange = changeSpy;
    }

    await render(ToggleDisabledWrapper);

    const button = screen.getByRole('button', { name: /Strike/i });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled');

    await user.click(button);
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-toggle-reactive-wrapper',
      imports: [ReactiveFormsModule, VoltToggle],
      template: `<volt-toggle [formControl]="control">Bold</volt-toggle>`,
    })
    class ToggleReactiveWrapper {
      control = new FormControl(false, { nonNullable: true });
    }

    const { fixture } = await render(ToggleReactiveWrapper);
    const button = screen.getByRole('button', { name: /Bold/i });

    expect(button).toHaveAttribute('aria-pressed', 'false');

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(button).toHaveAttribute('aria-pressed', 'true');

    await user.click(button);
    expect(fixture.componentInstance.control.value).toBe(false);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(button).toHaveAttribute('aria-disabled', 'true');

    await user.click(button);
    expect(fixture.componentInstance.control.value).toBe(false);
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-toggle-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltToggle],
      template: `<volt-toggle [formControl]="control">Bold</volt-toggle>`,
    })
    class ToggleInvalidWrapper {
      control = new FormControl(false, {
        nonNullable: true,
        validators: Validators.requiredTrue,
      });
    }

    const { fixture } = await render(ToggleInvalidWrapper);
    const button = screen.getByRole('button', { name: /Bold/i });

    expect(button).not.toHaveAttribute('aria-invalid');

    await user.tab();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(button).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-toggle-ng-model-wrapper',
      imports: [FormsModule, VoltToggle],
      template: `<volt-toggle [(ngModel)]="pressed">Italic</volt-toggle>`,
    })
    class ToggleNgModelWrapper {
      pressed = false;
    }

    const { fixture } = await render(ToggleNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const button = screen.getByRole('button', { name: /Italic/i });

    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    expect(fixture.componentInstance.pressed).toBe(true);
  });
});
