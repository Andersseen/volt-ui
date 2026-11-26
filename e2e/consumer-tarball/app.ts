import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  applyVoltTheme,
  VoltBadge,
  VoltCheckbox,
  VoltDialog,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogTitle,
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
} from '@voltui/components';

/**
 * The consumer application of scripts/check-consumer.mjs, authored once in package mode. The
 * harness builds it as written (imports from the installed @voltui/components tarball) and through
 * the package → CLI-copy transform (imports from the folder the installed `volt` binary copied).
 * A minimal atom, a form composition and an overlay; server-rendered and hydrated in both.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    VoltBadge,
    VoltCheckbox,
    VoltDialog,
    VoltDialogContent,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltDialogTitle,
    VoltError,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
  ],
  template: `
    <main class="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <section aria-labelledby="minimal-title" class="flex items-center gap-3">
        <h1 id="minimal-title" class="text-lg font-semibold">Consumer</h1>
        <button voltButton id="primary" type="button">Primary</button>
        <volt-badge variant="success">Ready</volt-badge>
      </section>

      <form
        [formGroup]="form"
        (ngSubmit)="submitted.set(true)"
        aria-label="Profile"
        class="flex flex-col gap-4"
      >
        <volt-form-field>
          <volt-label>Email</volt-label>
          <volt-input formControlName="email" type="email" placeholder="you@example.com" />
          <volt-hint>We only use it for account updates.</volt-hint>
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <volt-error>Enter a valid email address.</volt-error>
          }
        </volt-form-field>
        <volt-checkbox formControlName="terms" aria-label="Accept terms" />
        <button voltButton type="submit">Save</button>
        <output id="value">{{ form.getRawValue() | json }}</output>
        @if (submitted()) {
          <p id="submitted">Submitted</p>
        }
      </form>

      <button voltButton variant="outline" type="button" id="open-dialog" [voltDialog]="dialogTpl">
        Delete project
      </button>
      <ng-template #dialogTpl let-close="close">
        <div voltDialogOverlay></div>
        <div voltDialogContent>
          <h2 voltDialogTitle>Delete project?</h2>
          <p voltDialogDescription>This action cannot be undone.</p>
          <button voltButton variant="outline" type="button" (click)="close()">Cancel</button>
        </div>
      </ng-template>

      <div class="flex gap-2">
        <button voltButton variant="ghost" type="button" id="theme-ember" (click)="ember()">
          Ember
        </button>
        <button voltButton variant="ghost" type="button" id="theme-dark" (click)="dark()">
          Dark
        </button>
      </div>
    </main>
  `,
})
export class App {
  readonly submitted = signal(false);
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    terms: new FormControl(false, { nonNullable: true }),
  });

  ember() {
    applyVoltTheme({ color: 'ember' });
  }

  dark() {
    applyVoltTheme({ dark: true });
  }
}
