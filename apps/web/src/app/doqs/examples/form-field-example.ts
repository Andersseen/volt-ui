import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
} from '@voltui/components';

/**
 * Errors render once a field is touched (left, or the form submitted), so the alert is announced
 * then and not on every keystroke.
 */
@Component({
  selector: 'app-form-field-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    VoltFormField,
    VoltLabel,
    VoltHint,
    VoltError,
    VoltInput,
    VoltNativeButton,
  ],
  template: `
    <form class="mx-auto max-w-sm space-y-4" [formGroup]="login" (ngSubmit)="submit()" novalidate>
      <volt-form-field>
        <volt-label>Work email</volt-label>
        <volt-input formControlName="email" type="email" autocomplete="email" required />
        <volt-hint>We only use it for account updates.</volt-hint>
        @if (login.controls.email.touched && login.controls.email.invalid) {
          <volt-error>Enter a valid email address.</volt-error>
        }
      </volt-form-field>

      <volt-form-field>
        <volt-label>Password</volt-label>
        <volt-input
          formControlName="password"
          type="password"
          autocomplete="current-password"
          required
        />
        <volt-hint>At least 8 characters.</volt-hint>
        @if (login.controls.password.touched && login.controls.password.invalid) {
          <volt-error>Use at least 8 characters.</volt-error>
        }
      </volt-form-field>

      <button voltButton type="submit" class="w-full">Sign in</button>
    </form>
  `,
})
export class FormFieldExample {
  readonly login = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  submit(): void {
    // Shows every error at once; a real form would send the value when it is valid.
    this.login.markAllAsTouched();
  }
}
