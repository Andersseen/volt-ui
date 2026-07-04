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
});
