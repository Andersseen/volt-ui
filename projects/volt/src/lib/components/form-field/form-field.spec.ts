import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
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
});
