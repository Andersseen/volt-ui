import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LmnEyeIcon, LmnGithubIcon, LmnLockIcon } from 'lumen-icons';
import {
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardFooter,
  VoltCardHeader,
  VoltCardTitle,
  VoltCheckbox,
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltMeter,
  VoltMeterIndicator,
  VoltMeterTrack,
  VoltNativeButton,
  VoltSeparator,
} from 'volt';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const;

/**
 * Scores a password 0–4 on length and variety. A teaching heuristic, not a security control:
 * pair it with a real check (zxcvbn, or your server's breach lookup) before trusting it.
 */
export function passwordScore(password: string): number {
  if (password.length < 8) return 0;
  let score = 1;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

/**
 * A sign-up card: name, email, a password with a strength meter, and the terms.
 *
 * The meter is a `volt-meter` — `role="meter"` with a value and a spoken label ("Strength: Fair") —
 * and the same word is printed beside it, so the colour is never the only signal. The show/hide
 * button is a toggle (`aria-pressed`) next to the field, not inside it, so it has its own focus stop
 * and a stable name.
 *
 * Errors appear after the first submit and then update as you fix them. The terms checkbox is a
 * required field like the others, with its own message rather than a disabled submit button that
 * never says why.
 */
@Component({
  selector: 'app-auth-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardFooter,
    VoltCardHeader,
    VoltCardTitle,
    VoltCheckbox,
    VoltError,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltLabel,
    VoltMeter,
    VoltMeterIndicator,
    VoltMeterTrack,
    VoltNativeButton,
    VoltSeparator,
    LmnEyeIcon,
    LmnGithubIcon,
    LmnLockIcon,
  ],
  template: `
    <section
      class="@container grid min-h-[44rem] place-items-center bg-muted/30 px-4 py-16 @3xl:px-6"
    >
      <volt-card class="w-full max-w-md">
        <volt-card-header class="text-center">
          <volt-card-title><h2 class="text-2xl">Create your account</h2></volt-card-title>
          <volt-card-description>Free for 14 days. No card needed.</volt-card-description>
        </volt-card-header>

        <volt-card-content>
          <volt-button variant="outline" class="w-full">
            <lmn-github slot="leading" [size]="16" />
            Continue with GitHub
          </volt-button>

          <div class="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground">
            <volt-separator class="flex-1" />
            or with email
            <volt-separator class="flex-1" />
          </div>

          <form class="grid gap-5" novalidate (submit)="submit($event)">
            <volt-form-field>
              <volt-label>Full name</volt-label>
              <volt-input
                autocomplete="name"
                [state]="show('name') ? 'error' : 'default'"
                [value]="name()"
                (valueChange)="name.set($event)"
              />
              @if (show('name')) {
                <volt-error>Tell us what to call you.</volt-error>
              }
            </volt-form-field>

            <volt-form-field>
              <volt-label>Work email</volt-label>
              <volt-input
                type="email"
                autocomplete="email"
                [state]="show('email') ? 'error' : 'default'"
                [value]="email()"
                (valueChange)="email.set($event)"
              />
              @if (show('email')) {
                <volt-error>Enter an address like name&#64;company.com.</volt-error>
              }
            </volt-form-field>

            <volt-form-field>
              <volt-label>Password</volt-label>
              <div class="flex gap-2">
                <volt-input
                  class="flex-1"
                  autocomplete="new-password"
                  [type]="reveal() ? 'text' : 'password'"
                  [state]="show('password') ? 'error' : 'default'"
                  [value]="password()"
                  (valueChange)="password.set($event)"
                />
                <button
                  voltButton
                  type="button"
                  variant="outline"
                  size="icon"
                  [attr.aria-pressed]="reveal()"
                  aria-label="Show password"
                  (click)="reveal.set(!reveal())"
                >
                  @if (reveal()) {
                    <lmn-lock [size]="16" />
                  } @else {
                    <lmn-eye [size]="16" />
                  }
                </button>
              </div>
              @if (show('password')) {
                <volt-error>Use at least 8 characters.</volt-error>
              } @else {
                <volt-hint
                  >12 or more characters with a mix of cases, digits and symbols.</volt-hint
                >
              }
            </volt-form-field>

            <volt-meter
              class="-mt-2"
              [value]="score()"
              [max]="4"
              [valueLabel]="strengthLabel"
              aria-label="Password strength"
            >
              <div class="flex items-center gap-3">
                <volt-meter-track class="h-1.5 flex-1">
                  <volt-meter-indicator class="strength" [attr.data-score]="score()" />
                </volt-meter-track>
                <span class="w-16 text-right text-xs text-muted-foreground" aria-hidden="true">{{
                  strength()
                }}</span>
              </div>
            </volt-meter>

            <div class="grid gap-1.5">
              <div class="flex items-start gap-2">
                <volt-checkbox
                  id="signup-terms"
                  class="mt-0.5"
                  [checked]="terms()"
                  (checkedChange)="terms.set($event)"
                />
                <volt-label htmlFor="signup-terms" class="text-sm font-normal leading-5">
                  I agree to the <a href="#" class="underline underline-offset-4">terms</a> and the
                  <a href="#" class="underline underline-offset-4">privacy policy</a>.
                </volt-label>
              </div>
              @if (show('terms')) {
                <p class="text-sm text-error" role="alert">Accept the terms to continue.</p>
              }
            </div>

            <volt-button type="submit" class="w-full">Create account</volt-button>
          </form>
        </volt-card-content>

        <volt-card-footer class="justify-center text-sm text-muted-foreground">
          Already have an account?&nbsp;<a voltButton variant="link" href="#" class="h-auto p-0"
            >Sign in</a
          >
        </volt-card-footer>
      </volt-card>
    </section>
  `,
  styles: `
    .strength[data-score='0'],
    .strength[data-score='1'] {
      background: var(--error);
    }
    .strength[data-score='2'] {
      background: var(--warning);
    }
    .strength[data-score='3'],
    .strength[data-score='4'] {
      background: var(--success);
    }
  `,
})
export class AuthSignup {
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly terms = signal(false);
  protected readonly reveal = signal(false);
  private readonly submitted = signal(false);

  protected readonly score = computed(() => passwordScore(this.password()));
  protected readonly strength = computed(() => STRENGTH[this.score()]);
  protected readonly strengthLabel = (value: number) => STRENGTH[value] ?? '';

  private readonly invalid = computed(() => ({
    name: this.name().trim().length === 0,
    email: !EMAIL.test(this.email().trim()),
    password: this.password().length < 8,
    terms: !this.terms(),
  }));

  protected show(field: 'name' | 'email' | 'password' | 'terms'): boolean {
    return this.submitted() && this.invalid()[field];
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    // A real form would send here once Object.values(this.invalid()) is all false.
  }
}
