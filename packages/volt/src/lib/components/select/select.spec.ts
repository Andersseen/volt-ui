import { Component, model } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  TouchedChangeEvent,
  Validators,
} from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltSelect } from './select';
import { VoltSelectContent } from './select-content';
import { VoltSelectItem } from './select-item';

@Component({
  selector: 'app-select-test-wrapper',
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem],
  template: `
    <volt-select [(value)]="value" ariaLabel="Example choice" placeholder="Choose an option">
      <volt-select-content>
        <volt-select-item value="a">Option A</volt-select-item>
        <volt-select-item value="b">Option B</volt-select-item>
      </volt-select-content>
    </volt-select>
  `,
})
class SelectTestWrapper {
  readonly value = model<string | undefined>(undefined);
}

@Component({
  selector: 'app-select-multiple-test-wrapper',
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem],
  template: `
    <volt-select
      [(value)]="value"
      [multiple]="true"
      [displayWith]="displayWith"
      ariaLabel="Frameworks"
    >
      <volt-select-content>
        <volt-select-item value="angular">Angular</volt-select-item>
        <volt-select-item value="vue">Vue</volt-select-item>
      </volt-select-content>
    </volt-select>
  `,
})
class SelectMultipleTestWrapper {
  readonly value = model<string[]>(['angular', 'vue']);
  readonly displayWith = (value: unknown) => String(value).toUpperCase();
}

describe('VoltSelect', () => {
  it('should render the select trigger with placeholder', async () => {
    await render(SelectTestWrapper);

    expect(screen.getByRole('combobox', { name: 'Example choice' })).toHaveTextContent(
      'Choose an option'
    );
  });

  it('should reflect the selected value', async () => {
    await render(SelectTestWrapper, {
      componentInputs: { value: 'b' },
    });

    expect(screen.getByRole('combobox')).toHaveTextContent('b');
  });

  it('should render multiple selected values with displayWith labels', async () => {
    await render(SelectMultipleTestWrapper);

    expect(screen.getByRole('combobox', { name: 'Frameworks' })).toHaveTextContent('ANGULAR, VUE');
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-select-form-wrapper',
      imports: [ReactiveFormsModule, VoltSelect, VoltSelectContent, VoltSelectItem],
      template: `
        <volt-select [formControl]="control" placeholder="Choose an option">
          <volt-select-content>
            <volt-select-item value="a">Option A</volt-select-item>
            <volt-select-item value="b">Option B</volt-select-item>
          </volt-select-content>
        </volt-select>
      `,
    })
    class SelectFormWrapper {
      control = new FormControl<string | undefined>('a', { nonNullable: true });
    }

    const { fixture } = await render(SelectFormWrapper);
    const trigger = screen.getByRole('combobox');

    expect(trigger).toHaveTextContent('a');

    await user.click(trigger);
    await user.click(await screen.findByText('Option B'));
    expect(fixture.componentInstance.control.value).toBe('b');

    fixture.componentInstance.control.setValue('a');
    fixture.detectChanges();
    expect(trigger).toHaveTextContent('a');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(fixture.componentInstance.control.value).toBe('a');
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-select-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltSelect, VoltSelectContent, VoltSelectItem],
      template: `
        <volt-select [formControl]="control" placeholder="Choose an option">
          <volt-select-content>
            <volt-select-item value="a">Option A</volt-select-item>
          </volt-select-content>
        </volt-select>
      `,
    })
    class SelectInvalidWrapper {
      control = new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: Validators.required,
      });
    }

    const { fixture } = await render(SelectInvalidWrapper);
    const trigger = screen.getByRole('combobox');

    expect(trigger).not.toHaveAttribute('aria-invalid');

    await user.tab();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-select-ng-model-wrapper',
      imports: [FormsModule, VoltSelect, VoltSelectContent, VoltSelectItem],
      template: `
        <volt-select [(ngModel)]="value" placeholder="Choose an option">
          <volt-select-content>
            <volt-select-item value="a">Option A</volt-select-item>
            <volt-select-item value="b">Option B</volt-select-item>
          </volt-select-content>
        </volt-select>
      `,
    })
    class SelectNgModelWrapper {
      value = 'a';
    }

    const { fixture } = await render(SelectNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const trigger = screen.getByRole('combobox');

    expect(trigger).toHaveTextContent('a');

    await user.click(trigger);
    await user.click(await screen.findByText('Option B'));

    expect(fixture.componentInstance.value).toBe('b');
  });
});

describe('VoltSelect forms and ARIA contract', () => {
  @Component({
    selector: 'app-select-required-wrapper',
    imports: [ReactiveFormsModule, VoltSelect, VoltSelectContent, VoltSelectItem],
    template: `
      <volt-select [formControl]="control" ariaLabel="Plan" required>
        <volt-select-content>
          <volt-select-item value="free">Free</volt-select-item>
          <volt-select-item value="team" disabled>Team</volt-select-item>
          <volt-select-item value="pro">Pro</volt-select-item>
        </volt-select-content>
      </volt-select>
    `,
  })
  class SelectRequiredWrapper {
    control = new FormControl<string | null>(null, Validators.required);
  }

  it('does not mark the control touched while the pointer moves focus into the popup', async () => {
    const { fixture } = await render(SelectRequiredWrapper);
    const control = fixture.componentInstance.control;
    // Every moment the control was touched while still invalid: what a touched-and-invalid
    // error message (and an assertive alert) would render for.
    const touchedWhileInvalid: unknown[] = [];
    control.events.subscribe(event => {
      if (event instanceof TouchedChangeEvent && event.touched && control.invalid) {
        touchedWhileInvalid.push(control.value);
      }
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox', { name: 'Plan' }));
    await user.click(await screen.findByRole('option', { name: 'Pro' }));
    await fixture.whenStable();

    expect(control.value).toBe('pro');
    expect(touchedWhileInvalid).toEqual([]);
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');

    // Leaving the field is what touches it.
    await user.tab();
    expect(control.touched).toBe(true);
  });

  it('marks the control touched when the popup is dismissed by a click outside', async () => {
    const { fixture } = await render(SelectRequiredWrapper);
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox', { name: 'Plan' }));
    await user.click(await screen.findByRole('option', { name: 'Free' }));
    fixture.componentInstance.control.setValue(null);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.click(document.body);
    await fixture.whenStable();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('exposes required on the combobox', async () => {
    await render(SelectRequiredWrapper);

    expect(screen.getByRole('combobox', { name: 'Plan' })).toHaveAttribute('aria-required', 'true');
  });

  it('exposes a disabled option as disabled and skips it with the keyboard', async () => {
    await render(SelectRequiredWrapper);
    const user = userEvent.setup();
    const trigger = screen.getByRole('combobox', { name: 'Plan' });

    trigger.focus();
    await user.keyboard('{ArrowDown}');
    const team = await screen.findByRole('option', { name: 'Team' });
    const free = screen.getByRole('option', { name: 'Free' });
    const pro = screen.getByRole('option', { name: 'Pro' });

    expect(team).toHaveAttribute('aria-disabled', 'true');
    expect(free).not.toHaveAttribute('aria-disabled');
    expect(trigger).toHaveAttribute('aria-activedescendant', free.id);

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-activedescendant', pro.id);
  });
});
