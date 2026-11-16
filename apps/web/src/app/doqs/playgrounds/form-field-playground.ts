import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoltError, VoltFormField, VoltHint, VoltInput, VoltLabel } from 'volt';

/**
 * A real `FormControl` behind a form field. `required` adds or removes the validator; the error is
 * rendered once the control is touched, which is when it is announced.
 */
@Component({
  selector: 'app-form-field-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput],
  template: `
    <volt-form-field class="mx-auto max-w-xs">
      <volt-label>{{ label() }}</volt-label>
      <volt-input
        [formControl]="control"
        type="email"
        autocomplete="email"
        [required]="required()"
      />
      @if (hint()) {
        <volt-hint>{{ hint() }}</volt-hint>
      }
      @if (control.touched && control.invalid) {
        <volt-error>{{ error() }}</volt-error>
      }
      <p class="text-sm text-muted-foreground">
        status: <code class="text-foreground">{{ status() }}</code> · touched:
        <code class="text-foreground">{{ touched() }}</code>
      </p>
    </volt-form-field>
  `,
})
export class FormFieldPlayground {
  readonly label = input('Work email');
  readonly hint = input('We only use it for account updates.');
  readonly error = input('Enter a valid email address.');
  readonly required = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly statusChange = output<string>();
  readonly touchedChange = output<boolean>();

  protected readonly control = new FormControl('', { nonNullable: true });
  protected readonly status = signal('VALID');
  protected readonly touched = signal(false);

  constructor() {
    effect(() => {
      const validators = this.required()
        ? [Validators.required, Validators.email]
        : [Validators.email];
      this.control.setValidators(validators);
      this.control.updateValueAndValidity();
    });
    effect(() => (this.disabled() ? this.control.disable() : this.control.enable()));

    const subscription = this.control.events.subscribe(() => {
      if (this.status() !== this.control.status) {
        this.status.set(this.control.status);
        this.statusChange.emit(this.control.status);
      }
      if (this.touched() !== this.control.touched) {
        this.touched.set(this.control.touched);
        this.touchedChange.emit(this.control.touched);
      }
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }
}
