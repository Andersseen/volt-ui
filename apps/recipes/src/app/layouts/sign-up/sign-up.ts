import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltCheckbox,
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
} from 'volt';

/**
 * Registration form.
 *
 * The login shape plus what registration actually adds, which is the reason both exist:
 * more fields, somewhere for per-field errors to appear, and a submit that stays disabled
 * until the terms are accepted.
 *
 * `volt-error` goes inside the same `volt-form-field` as the control it belongs to, and
 * carries its own live region, so the message is announced when it appears rather than
 * only turning red.
 *
 * Worth knowing before you rely on it: the rest of the wiring comes from the form, not
 * from the markup. `volt-hint` is added to the control's `aria-describedby` by the
 * primitive on its own, but the error is only pulled in — and the input only marked
 * `aria-invalid` — once the control is a real form control with a validity state. This
 * demo is template-only, so it shows where the message goes and what it looks like; bind
 * `[formControl]` and the announcement wiring completes itself.
 */
@Component({
  selector: 'app-sign-up-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltFormField,
    VoltLabel,
    VoltInput,
    VoltHint,
    VoltError,
    VoltCheckbox,
    VoltButton,
  ],
  template: `
    <div class="flex min-h-[640px] items-center justify-center bg-muted/20 p-4">
      <volt-card class="w-full max-w-md p-8">
        <div class="mb-6">
          <h1 class="text-2xl font-bold tracking-tight">Create an account</h1>
          <p class="mt-1 text-sm text-muted-foreground">It takes about a minute.</p>
        </div>

        <form class="space-y-5" (submit)="$event.preventDefault()">
          <div class="grid gap-5 sm:grid-cols-2">
            <volt-form-field>
              <volt-label>First name</volt-label>
              <volt-input autocomplete="given-name" />
            </volt-form-field>
            <volt-form-field>
              <volt-label>Last name</volt-label>
              <volt-input autocomplete="family-name" />
            </volt-form-field>
          </div>

          <volt-form-field>
            <volt-label>Work email</volt-label>
            <volt-input
              type="email"
              autocomplete="email"
              [(value)]="email"
              placeholder="you@company.com"
            />
            <!-- Both slots exist; the field decides which one is showing. -->
            @if (emailInvalid()) {
              <volt-error>Enter a valid email address.</volt-error>
            } @else {
              <volt-hint>We send one confirmation, nothing else.</volt-hint>
            }
          </volt-form-field>

          <volt-form-field>
            <volt-label>Password</volt-label>
            <volt-input type="password" autocomplete="new-password" [(value)]="password" />
            @if (passwordTooShort()) {
              <volt-error>Use at least 8 characters.</volt-error>
            } @else {
              <volt-hint>At least 8 characters, including a number.</volt-hint>
            }
          </volt-form-field>

          <!-- Bound id, not a static one: see the note in the login layout. -->
          <div class="flex items-start gap-2.5 text-sm leading-relaxed">
            <volt-checkbox class="mt-0.5" [id]="'signup-terms'" [(checked)]="acceptedTerms" />
            <label for="signup-terms" class="cursor-pointer">
              I agree to the
              <a href="#" class="text-primary underline-offset-4 hover:underline">terms</a>
              and the
              <a href="#" class="text-primary underline-offset-4 hover:underline">
                privacy policy </a
              >.
            </label>
          </div>

          <volt-button type="submit" size="lg" class="w-full" [disabled]="!acceptedTerms()">
            Create account
          </volt-button>
        </form>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          Already registered?
          <a href="#" class="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </a>
        </p>
      </volt-card>
    </div>
  `,
})
export class SignUpLayout {
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly acceptedTerms = signal(false);

  /** Only complain once there is something to complain about. */
  protected readonly emailInvalid = computed(() => {
    const value = this.email();
    return value.length > 0 && !value.includes('@');
  });

  protected readonly passwordTooShort = computed(() => {
    const value = this.password();
    return value.length > 0 && value.length < 8;
  });
}
