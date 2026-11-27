import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltCheckbox,
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSpinner,
  VoltSwitch,
} from 'volt';
import type { PreviewState } from './preview-state';

/** What the form starts with, and what Discard returns to. */
const INITIAL_VALUE = {
  name: 'Acme',
  email: 'billing@acme.test',
  plan: 'team',
  digest: true,
  terms: false,
};

/** Sample application: a settings form with real validation. Specimen copy. */
@Component({
  selector: 'app-preview-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltCheckbox,
    VoltError,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSpinner,
    VoltSwitch,
  ],
  template: `
    <form
      class="mx-auto max-w-lg space-y-4 p-4"
      [formGroup]="form"
      (ngSubmit)="submit()"
      novalidate
    >
      <h3 class="text-lg font-semibold">Workspace settings</h3>

      @if (state() === 'error') {
        <volt-alert variant="destructive" role="alert">
          <volt-alert-title>Your changes were not saved</volt-alert-title>
          <volt-alert-description
            >The server rejected the request. Nothing was lost; try again.</volt-alert-description
          >
        </volt-alert>
      } @else if (saved()) {
        <volt-alert variant="success" role="status">
          <volt-alert-title>Settings saved</volt-alert-title>
        </volt-alert>
      }

      <volt-form-field>
        <volt-label>Workspace name</volt-label>
        <volt-input formControlName="name" autocomplete="organization" />
        <volt-hint>Shown to everyone you invite.</volt-hint>
        <volt-error>Use at least 3 characters.</volt-error>
      </volt-form-field>

      <volt-form-field>
        <volt-label>Billing email</volt-label>
        <volt-input formControlName="email" type="email" autocomplete="email" />
        <volt-error>Enter a valid email address.</volt-error>
      </volt-form-field>

      <volt-form-field>
        <volt-label>Plan</volt-label>
        <volt-select formControlName="plan" placeholder="Choose a plan">
          <volt-select-content>
            <volt-select-item value="free">Free</volt-select-item>
            <volt-select-item value="team">Team</volt-select-item>
            <volt-select-item value="enterprise">Enterprise</volt-select-item>
          </volt-select-content>
        </volt-select>
        <volt-error>Choose a plan.</volt-error>
      </volt-form-field>

      <div class="flex items-center justify-between gap-3">
        <label for="preview-digest" class="text-sm">Weekly digest</label>
        <volt-switch [id]="'preview-digest'" formControlName="digest" />
      </div>

      <div class="flex items-center gap-2">
        <volt-checkbox id="preview-terms" formControlName="terms" />
        <volt-label htmlFor="preview-terms">I accept the data processing terms</volt-label>
      </div>

      <div class="flex flex-wrap justify-end gap-2">
        <button voltButton type="button" variant="outline" (click)="reset()">Discard</button>
        <button
          voltButton
          type="submit"
          [disabled]="state() === 'disabled' || state() === 'loading'"
        >
          @if (state() === 'loading') {
            <volt-spinner size="sm" />
          }
          Save changes
        </button>
      </div>
    </form>
  `,
})
export class PreviewSettings {
  readonly state = input<PreviewState>('default');

  protected readonly saved = signal(false);
  protected readonly form = new FormGroup({
    name: new FormControl('Acme', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('billing@acme.test', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    plan: new FormControl<string | null>('team', Validators.required),
    digest: new FormControl(true, { nonNullable: true }),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  constructor() {
    // The state control drives the form like the app would: disabled, emptied or shown invalid.
    effect(() => {
      const state = this.state();
      this.saved.set(false);
      this.form.reset(INITIAL_VALUE);
      if (state === 'disabled') this.form.disable();
      else this.form.enable();
      if (state === 'empty')
        this.form.setValue({ name: '', email: '', plan: null, digest: false, terms: false });
      if (state === 'invalid') {
        this.form.setValue({
          name: 'A',
          email: 'not-an-email',
          plan: null,
          digest: false,
          terms: false,
        });
        this.form.markAllAsTouched();
      }
    });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    this.saved.set(this.form.valid);
  }

  protected reset(): void {
    this.form.reset(INITIAL_VALUE);
    this.saved.set(false);
  }
}
