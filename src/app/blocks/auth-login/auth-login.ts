import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnArrowRightIcon, LmnCheckIcon, LmnZapIcon } from 'lumen-icons';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltButton,
  VoltCheckbox,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltSeparator,
} from 'volt';

/**
 * Login as a finished screen, not as a shape.
 *
 * The layouts tab has the same subject stripped to its skeleton, and the pair is the
 * clearest statement of what the two galleries are for. That one is a centred card with
 * no brand on it, because a layout with somebody else's brand is useless to everyone
 * whose brand is different. This one is the version you would actually ship: a marketing
 * panel beside the form, a mark, a quote, and motion.
 *
 * What does not change between them is the form itself. Both use `volt-form-field`, so
 * the primitive generates the ids and wires label, control and hint together — the
 * polish sits on top of the same correct field composition rather than replacing it.
 */
@Component({
  selector: 'app-auth-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltFormField,
    VoltLabel,
    VoltInput,
    VoltHint,
    VoltCheckbox,
    VoltButton,
    VoltSeparator,
    VoltAvatar,
    VoltAvatarFallback,
    LmnZapIcon,
    LmnCheckIcon,
    LmnArrowRightIcon,
  ],
  template: `
    <section class="@container min-h-[640px] bg-background">
      <!-- Two panels once there is room for two; the form alone before that. The brand
           panel is the half that goes, because it is the half that is decoration. -->
      <div class="grid min-h-[640px] @4xl:grid-cols-2">
        <div class="brand relative hidden overflow-hidden p-12 @4xl:flex @4xl:flex-col">
          <span class="aurora aurora-a pointer-events-none absolute" aria-hidden="true"></span>
          <span class="aurora aurora-b pointer-events-none absolute" aria-hidden="true"></span>

          <div class="relative flex items-center gap-2">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <lmn-zap [size]="16" />
            </span>
            <span class="text-lg font-semibold tracking-tight">Northwind</span>
          </div>

          <div class="relative mt-auto">
            <blockquote class="rise text-balance text-2xl font-medium leading-snug">
              “We moved the whole platform over in an afternoon. The part I did not expect was that
              the diff was readable.”
            </blockquote>

            <div class="rise rise-2 mt-6 flex items-center gap-3">
              <volt-avatar>
                <volt-avatar-fallback class="text-xs">MI</volt-avatar-fallback>
              </volt-avatar>
              <div>
                <p class="text-sm font-medium">Marta Ibáñez</p>
                <p class="text-xs text-muted-foreground">Staff Engineer, Acme</p>
              </div>
            </div>

            <ul
              class="rise rise-3 mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              @for (point of points; track point) {
                <li class="flex items-center gap-1.5">
                  <lmn-check [size]="14" class="text-success" />
                  {{ point }}
                </li>
              }
            </ul>
          </div>
        </div>

        <div class="flex items-center justify-center p-6 @2xl:p-10">
          <div class="w-full max-w-sm">
            <!-- The mark shows here only while the brand panel is hidden, so it is never
                 on screen twice. -->
            <div class="mb-8 flex items-center gap-2 @4xl:hidden">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <lmn-zap [size]="16" />
              </span>
              <span class="text-lg font-semibold tracking-tight">Northwind</span>
            </div>

            <h1 class="rise text-2xl font-bold tracking-tight @2xl:text-3xl">Welcome back</h1>
            <p class="rise rise-2 mt-1.5 text-sm text-muted-foreground">
              Sign in to pick up where you left off.
            </p>

            <form class="rise rise-3 mt-8 space-y-5" (submit)="$event.preventDefault()">
              <volt-form-field>
                <volt-label>Email</volt-label>
                <volt-input type="email" autocomplete="email" placeholder="you@company.com" />
              </volt-form-field>

              <volt-form-field>
                <div class="flex items-baseline justify-between gap-4">
                  <volt-label>Password</volt-label>
                  <a href="#" class="text-xs text-primary underline-offset-4 hover:underline">
                    Forgot?
                  </a>
                </div>
                <volt-input type="password" autocomplete="current-password" />
                <volt-hint>At least 8 characters.</volt-hint>
              </volt-form-field>

              <div class="flex items-center gap-2">
                <volt-checkbox [id]="'auth-login-remember'" />
                <label for="auth-login-remember" class="cursor-pointer text-sm">
                  Keep me signed in
                </label>
              </div>

              <volt-button type="submit" size="lg" class="group w-full">
                Sign in
                <lmn-arrow-right
                  slot="trailing"
                  [size]="16"
                  class="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                />
              </volt-button>
            </form>

            <!-- The rules are wrapped rather than sized directly: volt-separator composes its
                 own classes without twMerge, so its shrink-0 and w-full win over anything put
                 on it and each rule takes the full row. The wrapper is what shrinks. -->
            <div class="my-6 flex items-center gap-3">
              <span class="min-w-0 flex-1"><volt-separator /></span>
              <span class="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
                or
              </span>
              <span class="min-w-0 flex-1"><volt-separator /></span>
            </div>

            <div class="grid gap-2 @md:grid-cols-2">
              @for (provider of providers; track provider) {
                <volt-button variant="outline" class="w-full">{{ provider }}</volt-button>
              }
            </div>

            <p class="mt-8 text-center text-sm text-muted-foreground">
              No account yet?
              <a href="#" class="font-medium text-primary underline-offset-4 hover:underline">
                Start a trial
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .brand {
      background: color-mix(in oklch, var(--primary) 7%, var(--surface));
      border-inline-end: 1px solid var(--border);
    }

    .aurora {
      border-radius: 9999px;
      filter: blur(80px);
      opacity: 0.45;
    }

    .aurora-a {
      top: -15%;
      left: -10%;
      height: 24rem;
      width: 24rem;
      background: color-mix(in oklch, var(--primary) 55%, transparent);
      animation: drift-a 20s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
    }

    .aurora-b {
      right: -20%;
      bottom: -10%;
      height: 20rem;
      width: 20rem;
      background: color-mix(in oklch, var(--info) 45%, transparent);
      animation: drift-b 24s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
    }

    /* A login is above the fold by definition, so the entrance is CSS and starts at first
       paint rather than waiting for hydration. */
    .rise {
      animation: rise 640ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .rise-2 {
      animation-delay: 90ms;
    }
    .rise-3 {
      animation-delay: 180ms;
    }

    @keyframes rise {
      from {
        opacity: 0;
        translate: 0 14px;
      }
      to {
        opacity: 1;
        translate: none;
      }
    }

    @keyframes drift-a {
      to {
        translate: 5rem 3rem;
        scale: 1.15;
      }
    }

    @keyframes drift-b {
      to {
        translate: -4rem -3rem;
        scale: 1.1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .rise,
      .aurora {
        animation: none;
      }
    }
  `,
})
export class AuthLogin {
  protected readonly providers = ['Google', 'GitHub'];
  protected readonly points = ['SOC 2 Type II', 'SSO included', 'No card to start'];
}
