import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
  VoltNativeSelect,
  VoltSpinner,
  VoltSwitch,
} from 'volt';

/**
 * RECIPE — Settings form with validation, one async save, and recovery.
 *
 * What it teaches, in the order a user meets it:
 *   1. Dirty state is "differs from the last saved values", not Angular's `dirty` flag, so
 *      typing a value back to what it was makes the form clean again.
 *   2. An invalid submit shows every error and moves focus to the first invalid control.
 *   3. A valid submit starts exactly one request. While it is pending the Save button gets
 *      `aria-disabled` rather than `disabled`: a disabled button that has focus drops it to
 *      <body>, and a keyboard user would lose their place on every save.
 *   4. Success becomes the new baseline and is announced politely. Failure keeps what the user
 *      typed, says what happened, and a second press of Save retries.
 *   5. Cancel restores the last *saved* values, not whatever the page first loaded with.
 *
 * Connect it to your API by replacing `fakeSave` (or passing your own function to `[save]`);
 * nothing else here is specific to the fake. There is no form framework: a FormGroup, three
 * signals and two small methods are all it takes.
 */

export interface Settings {
  name: string;
  email: string;
  language: 'en' | 'es' | 'uk';
  weeklyDigest: boolean;
}

export type SaveSettings = (value: Settings) => Promise<Settings>;

/** REPLACE ME. Resolves after a moment; rejects for any @fail.test address so failure is testable. */
export const fakeSave: SaveSettings = value =>
  new Promise((resolve, reject) =>
    setTimeout(
      () =>
        value.email.endsWith('@fail.test')
          ? reject(new Error('The server could not be reached.'))
          : resolve(value),
      400
    )
  );

const INITIAL: Settings = {
  name: 'Marta Ibáñez',
  email: 'marta@example.com',
  language: 'en',
  weeklyDigest: true,
};

type Result = { kind: 'saved' } | { kind: 'failed'; message: string } | null;

@Component({
  selector: 'app-settings-form-recipe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltError,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
    VoltNativeSelect,
    VoltSpinner,
    VoltSwitch,
  ],
  template: `
    <form
      class="mx-auto max-w-md space-y-5"
      novalidate
      [formGroup]="form"
      [attr.aria-busy]="saving()"
      (ngSubmit)="submit()"
    >
      <volt-form-field>
        <volt-label>Name</volt-label>
        <volt-input formControlName="name" autocomplete="name" />
        @if (showError('name')) {
          <volt-error>Enter your name.</volt-error>
        }
      </volt-form-field>

      <volt-form-field>
        <volt-label>Email</volt-label>
        <volt-input formControlName="email" type="email" autocomplete="email" />
        <volt-hint>Use an address ending in &#64;fail.test to see the failure path.</volt-hint>
        @if (showError('email')) {
          <volt-error>Enter a valid email address.</volt-error>
        }
      </volt-form-field>

      <volt-form-field>
        <volt-label>Language</volt-label>
        <select voltNativeSelect formControlName="language">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="uk">Українська</option>
        </select>
      </volt-form-field>

      <div class="flex items-center justify-between gap-4">
        <volt-label htmlFor="digest">Weekly digest</volt-label>
        <volt-switch id="digest" formControlName="weeklyDigest" />
      </div>

      <!--
        One live region, always in the DOM, so a screen reader hears each change. Success is a
        plain alert inside it (polite). Failure carries role="alert" and is announced once, by
        itself; the live region is not also marked assertive, which would read it twice.
      -->
      <div aria-live="polite">
        @if (result(); as result) {
          @if (result.kind === 'saved') {
            <volt-alert variant="success">
              <volt-alert-title>Settings saved</volt-alert-title>
            </volt-alert>
          }
        }
      </div>
      @if (result(); as result) {
        @if (result.kind === 'failed') {
          <volt-alert variant="destructive" role="alert">
            <volt-alert-title>Could not save your settings</volt-alert-title>
            <volt-alert-description>
              {{ result.message }} Your changes are still here; press Save to try again.
            </volt-alert-description>
          </volt-alert>
        }
      }

      <div class="flex justify-end gap-2">
        <button
          voltButton
          variant="outline"
          type="button"
          [disabled]="!dirty() || saving()"
          (click)="cancel()"
        >
          Cancel
        </button>
        <!-- aria-disabled, not disabled: keeps focus while pending. submit() guards the action. -->
        <button
          voltButton
          type="submit"
          [attr.aria-disabled]="saving() || !dirty() ? 'true' : null"
        >
          @if (saving()) {
            <volt-spinner size="sm" />
            Saving…
          } @else {
            Save changes
          }
        </button>
      </div>
    </form>
  `,
  host: { '[attr.data-state]': 'saving() ? "saving" : dirty() ? "dirty" : "clean"' },
})
export class SettingsFormRecipe implements OnInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The one thing you swap for a real call. */
  readonly save = input<SaveSettings>(fakeSave);
  readonly initial = input<Settings>(INITIAL);

  /** The last values the server accepted. Cancel returns here. */
  private readonly saved = signal<Settings>(INITIAL);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    language: new FormControl<Settings['language']>('en', { nonNullable: true }),
    weeklyDigest: new FormControl(true, { nonNullable: true }),
  });

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  protected readonly saving = signal(false);
  protected readonly result = signal<Result>(null);

  protected readonly dirty = computed(() => {
    const now = this.value();
    const base = this.saved();
    return (Object.keys(base) as (keyof Settings)[]).some(key => now[key] !== base[key]);
  });

  ngOnInit(): void {
    this.saved.set(this.initial());
    this.form.reset(this.initial());
  }

  protected showError(name: 'name' | 'email'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected async submit(): Promise<void> {
    // aria-disabled does not stop the native submit: this guard is the real "disabled".
    if (this.saving() || !this.dirty()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.result.set(null);
      this.focusFirstInvalid();
      return;
    }

    this.saving.set(true);
    this.result.set(null);
    try {
      const saved = await this.save()(this.form.getRawValue());
      this.saved.set(saved);
      this.form.reset(saved);
      this.result.set({ kind: 'saved' });
    } catch (error) {
      // Keep the form exactly as the user left it.
      this.result.set({ kind: 'failed', message: (error as Error).message });
    } finally {
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    this.form.reset(this.saved());
    this.result.set(null);
  }

  /** Runs after the error messages render, so `aria-invalid` is already on the control. */
  private focusFirstInvalid(): void {
    queueMicrotask(() =>
      this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    );
  }
}
