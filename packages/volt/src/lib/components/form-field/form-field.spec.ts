import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltInput } from '../input';
import { VoltTextarea } from '../textarea';
import { VoltSelect, VoltSelectContent, VoltSelectItem } from '../select';
import { VoltFormField, VoltLabel, VoltHint, VoltError } from './';

@Component({
  selector: 'app-form-field-test-wrapper',
  imports: [VoltFormField, VoltLabel, VoltHint, VoltError],
  template: `
    <volt-form-field>
      <volt-label>Email</volt-label>
      <volt-hint>We will never share your email.</volt-hint>
      <volt-error>Invalid email</volt-error>
    </volt-form-field>
  `,
})
class FormFieldTestWrapper {}

describe('VoltFormField', () => {
  it('should render label, hint, and error', async () => {
    await render(FormFieldTestWrapper);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('We will never share your email.')).toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('should apply error styling when error input is set', async () => {
    @Component({
      selector: 'app-form-field-error-wrapper',
      imports: [VoltLabel],
      template: `<volt-label [error]="true">Error Label</volt-label>`,
    })
    class FormFieldErrorWrapper {}

    const { container } = await render(FormFieldErrorWrapper);
    const label = container.querySelector('label');
    expect(label).toHaveClass('text-error');
  });

  it('should associate labels with projected input controls', async () => {
    @Component({
      selector: 'app-form-field-input-wrapper',
      imports: [VoltFormField, VoltLabel, VoltInput],
      template: `
        <volt-form-field>
          <volt-label>Email</volt-label>
          <volt-input id="email" />
        </volt-form-field>
      `,
    })
    class FormFieldInputWrapper {}

    await render(FormFieldInputWrapper);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Email');

    expect(label).toHaveAttribute('id');
    expect(input).toHaveAttribute('aria-labelledby', label.getAttribute('id'));
  });

  it('should wire hint text through aria-describedby', async () => {
    @Component({
      selector: 'app-form-field-described-wrapper',
      imports: [VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput],
      template: `
        <volt-form-field>
          <volt-label>Email</volt-label>
          <volt-input id="email" />
          <volt-hint>Use your work email.</volt-hint>
          <volt-error>Invalid email</volt-error>
        </volt-form-field>
      `,
    })
    class FormFieldDescribedWrapper {}

    await render(FormFieldDescribedWrapper);

    const input = screen.getByRole('textbox');
    const hint = screen.getByText('Use your work email.');

    expect(hint).toHaveAttribute('id');
    expect(input.getAttribute('aria-describedby')).toContain(hint.getAttribute('id'));
  });

  it('should associate projected textarea and select controls', async () => {
    @Component({
      selector: 'app-form-field-projected-wrapper',
      imports: [
        VoltFormField,
        VoltLabel,
        VoltTextarea,
        VoltSelect,
        VoltSelectContent,
        VoltSelectItem,
      ],
      template: `
        <volt-form-field>
          <volt-label>Message</volt-label>
          <volt-textarea id="message" />
        </volt-form-field>
        <volt-form-field>
          <volt-label>Plan</volt-label>
          <volt-select>
            <volt-select-content>
              <volt-select-item value="pro">Pro</volt-select-item>
            </volt-select-content>
          </volt-select>
        </volt-form-field>
      `,
    })
    class FormFieldProjectedWrapper {}

    await render(FormFieldProjectedWrapper);

    const textarea = screen.getByRole('textbox');
    const select = screen.getByRole('combobox');
    const messageLabel = screen.getByText('Message');
    const planLabel = screen.getByText('Plan');

    expect(textarea).toHaveAttribute('aria-labelledby', messageLabel.getAttribute('id'));
    expect(select).toHaveAttribute('aria-labelledby', planLabel.getAttribute('id'));
  });

  it('should expose invalid state on projected controls after touch', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-form-field-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput],
      template: `
        <volt-form-field>
          <volt-label>Email</volt-label>
          <volt-input [formControl]="control" />
          <volt-hint>Use your work email.</volt-hint>
          <volt-error>Email is required.</volt-error>
        </volt-form-field>
      `,
    })
    class FormFieldInvalidWrapper {
      control = new FormControl('', { nonNullable: true, validators: Validators.required });
    }

    const { fixture } = await render(FormFieldInvalidWrapper);
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required.');
  });

  describe('label association', () => {
    it('focuses the control when its label is clicked inside a form field, without ids', async () => {
      await render(
        `<volt-form-field>
          <volt-label>Email</volt-label>
          <volt-input />
          <volt-hint>We never share it.</volt-hint>
        </volt-form-field>`,
        { imports: [VoltFormField, VoltLabel, VoltHint, VoltInput] }
      );

      const control = screen.getByRole('textbox', { name: 'Email' });
      expect(control).toHaveAccessibleDescription('We never share it.');
      await userEvent.setup().click(screen.getByText('Email'));
      expect(control).toHaveFocus();
    });

    it('focuses the control through htmlFor outside a form field', async () => {
      const { container } = await render(
        `<volt-label htmlFor="city">City</volt-label><volt-input id="city" />`,
        { imports: [VoltLabel, VoltInput] }
      );

      expect(container.querySelector('label')).toHaveAttribute('for', 'city');
      await userEvent.setup().click(screen.getByText('City'));
      expect(screen.getByRole('textbox', { name: 'City' })).toHaveFocus();
    });

    it('applies error styling and custom classes to the native label', async () => {
      const { container } = await render(
        `<volt-label error class="uppercase text-xs">Name</volt-label>`,
        { imports: [VoltLabel] }
      );
      const label = container.querySelector('label')!;

      expect(label).toHaveClass('text-error', 'uppercase', 'text-xs');
      expect(label).not.toHaveClass('text-sm');
    });
  });

  describe('error lifecycle', () => {
    @Component({
      selector: 'app-form-field-error-lifecycle',
      imports: [ReactiveFormsModule, VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput],
      template: `
        <volt-form-field>
          <volt-label>Email</volt-label>
          <volt-input [formControl]="email" />
          <volt-hint>Use your work email.</volt-hint>
          @if (email.touched && email.invalid) {
            <volt-error>Email is required.</volt-error>
          }
        </volt-form-field>
        <volt-form-field>
          <volt-label>Name</volt-label>
          <volt-input [formControl]="name" />
          @if (name.touched && name.invalid) {
            <volt-error>Name is required.</volt-error>
          }
        </volt-form-field>
      `,
    })
    class ErrorLifecycleHost {
      email = new FormControl('', { nonNullable: true, validators: Validators.required });
      name = new FormControl('', { nonNullable: true, validators: Validators.required });
    }

    const describedBy = (element: HTMLElement) =>
      (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

    it('describes the control by its error while it shows, and drops the reference once corrected', async () => {
      const { fixture } = await render(ErrorLifecycleHost);
      const user = userEvent.setup();
      const email = screen.getByRole('textbox', { name: 'Email' });

      expect(email).toHaveAccessibleDescription('Use your work email.');
      expect(email).not.toHaveAttribute('aria-invalid');

      await user.click(email);
      await user.tab();
      await fixture.whenStable();

      const error = screen.getByText('Email is required.');
      expect(email).toHaveAttribute('aria-invalid', 'true');
      expect(describedBy(email)).toContain(error.id);
      expect(email).toHaveAccessibleDescription('Use your work email. Email is required.');

      await user.type(email, 'ada@example.com');
      await fixture.whenStable();

      expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
      expect(email).not.toHaveAttribute('aria-invalid');
      // Every id the control points at must still exist: no stale reference to the removed error.
      for (const id of describedBy(email)) {
        expect(document.getElementById(id)).not.toBeNull();
      }
      expect(email).toHaveAccessibleDescription('Use your work email.');
    });

    it('keeps each field wired to its own messages, with unique ids', async () => {
      const { fixture } = await render(ErrorLifecycleHost);
      fixture.componentInstance.email.markAsTouched();
      fixture.componentInstance.name.markAsTouched();
      await fixture.whenStable();

      const email = screen.getByRole('textbox', { name: 'Email' });
      const name = screen.getByRole('textbox', { name: 'Name' });
      expect(email).toHaveAccessibleDescription('Use your work email. Email is required.');
      expect(name).toHaveAccessibleDescription('Name is required.');

      const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('clears the invalid state and the error on form reset', async () => {
      const { fixture } = await render(ErrorLifecycleHost);
      const email = screen.getByRole('textbox', { name: 'Email' });
      fixture.componentInstance.email.markAsTouched();
      await fixture.whenStable();
      expect(email).toHaveAttribute('aria-invalid', 'true');

      fixture.componentInstance.email.reset();
      await fixture.whenStable();

      expect(email).not.toHaveAttribute('aria-invalid');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      for (const id of describedBy(email)) {
        expect(document.getElementById(id)).not.toBeNull();
      }
    });
  });
});
