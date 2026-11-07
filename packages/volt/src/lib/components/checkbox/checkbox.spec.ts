import { Component, input, model, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-checkbox-form-wrapper',
      imports: [ReactiveFormsModule, VoltCheckbox],
      template: `<volt-checkbox [formControl]="control">Accept</volt-checkbox>`,
    })
    class CheckboxFormWrapper {
      control = new FormControl(false, { nonNullable: true });
    }

    const { fixture } = await render(CheckboxFormWrapper);
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    expect(fixture.componentInstance.control.value).toBe(true);

    fixture.componentInstance.control.setValue(false);
    fixture.detectChanges();
    expect(checkbox).not.toBeChecked();

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);
    expect(fixture.componentInstance.control.value).toBe(false);
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-checkbox-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltCheckbox],
      template: `<volt-checkbox [formControl]="control">Accept</volt-checkbox>`,
    })
    class CheckboxInvalidWrapper {
      control = new FormControl(false, {
        nonNullable: true,
        validators: Validators.requiredTrue,
      });
    }

    const { fixture } = await render(CheckboxInvalidWrapper);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toHaveAttribute('aria-invalid');

    await user.tab();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-checkbox-ng-model-wrapper',
      imports: [FormsModule, VoltCheckbox],
      template: `<volt-checkbox [(ngModel)]="checked">Accept</volt-checkbox>`,
    })
    class CheckboxNgModelWrapper {
      checked = false;
    }

    const { fixture } = await render(CheckboxNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(fixture.componentInstance.checked).toBe(true);
  });

  it('keeps a consumer id on the native checkbox only, so <label for> works', async () => {
    const { container } = await render(
      `<volt-checkbox id="terms" /><label for="terms">Accept terms</label>`,
      { imports: [VoltCheckbox] }
    );

    expect(container.querySelectorAll('#terms')).toHaveLength(1);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    await userEvent.setup().click(screen.getByText('Accept terms'));
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('names the native checkbox from aria-label written on the host', async () => {
    const { container } = await render(`<volt-checkbox aria-label="Auto-sync" />`, {
      imports: [VoltCheckbox],
    });

    expect(screen.getByRole('checkbox', { name: 'Auto-sync' })).toBeInTheDocument();
    expect(container.querySelector('volt-checkbox')).not.toHaveAttribute('aria-label');
  });

  it('names the native checkbox from the ariaLabel input', async () => {
    await render(`<volt-checkbox ariaLabel="Remember me" />`, { imports: [VoltCheckbox] });

    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeInTheDocument();
  });

  describe('indeterminate and forms', () => {
    @Component({
      selector: 'app-checkbox-select-all',
      imports: [ReactiveFormsModule, VoltCheckbox],
      template: `
        <volt-checkbox
          aria-label="Select all"
          [formControl]="all"
          [indeterminate]="mixed()"
          (indeterminateChange)="indeterminateChanges.push($event)"
        />
      `,
    })
    class SelectAllHost {
      all = new FormControl(false, { nonNullable: true });
      readonly mixed = signal(true);
      readonly indeterminateChanges: boolean[] = [];
    }

    it('keeps a bound mixed state through the initial forms write', async () => {
      const { fixture } = await render(SelectAllHost);

      expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
        'aria-checked',
        'mixed'
      );
      expect(fixture.componentInstance.indeterminateChanges).toEqual([]);
    });

    it('keeps the mixed state when forms write the value it already has', async () => {
      const { fixture } = await render(SelectAllHost);

      fixture.componentInstance.all.setValue(false);
      await fixture.whenStable();

      expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
        'aria-checked',
        'mixed'
      );
    });

    it('resolves the mixed state when forms write a different value', async () => {
      const { fixture } = await render(SelectAllHost);

      fixture.componentInstance.all.setValue(true);
      await fixture.whenStable();

      expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(fixture.componentInstance.indeterminateChanges).toEqual([false]);
    });

    it('turns a mixed checkbox checked on activation and reports it to forms once', async () => {
      const { fixture } = await render(SelectAllHost);
      const values: boolean[] = [];
      fixture.componentInstance.all.valueChanges.subscribe(value => values.push(value));
      const box = screen.getByRole('checkbox', { name: 'Select all' });

      await userEvent.setup().click(box);

      expect(box).toHaveAttribute('aria-checked', 'true');
      expect(values).toEqual([true]);
      expect(fixture.componentInstance.all.dirty).toBe(true);
      expect(fixture.componentInstance.indeterminateChanges).toEqual([false]);
    });

    it('does not report a programmatic write back to forms as a change', async () => {
      const { fixture } = await render(SelectAllHost);
      const control = fixture.componentInstance.all;

      control.setValue(true);
      await fixture.whenStable();

      expect(control.dirty).toBe(false);
      expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('toggles with the Space key', async () => {
      const { fixture } = await render(SelectAllHost);
      fixture.componentInstance.mixed.set(false);
      await fixture.whenStable();
      const box = screen.getByRole('checkbox', { name: 'Select all' });

      box.focus();
      await userEvent.setup().keyboard(' ');

      expect(fixture.componentInstance.all.value).toBe(true);
      expect(box).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('numbers generated ids per application, not per JavaScript realm', async () => {
    const first = await render(`<volt-checkbox aria-label="Terms" />`, { imports: [VoltCheckbox] });
    const firstId = screen.getByRole('checkbox').id;
    first.fixture.destroy();
    TestBed.resetTestingModule();

    // A second application in the same realm (a second server-rendered request) counts from the
    // same start, so the server and the browser produce the same ids.
    await render(`<volt-checkbox aria-label="Terms" />`, { imports: [VoltCheckbox] });

    expect(firstId).toMatch(/^volt-checkbox-\d+$/);
    expect(screen.getByRole('checkbox').id).toBe(firstId);
  });
});
