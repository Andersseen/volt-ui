import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { LmnCheckIcon, LmnMailIcon } from 'lumen-icons';
import { VoltButton, VoltError, VoltFormField, VoltHint, VoltInput, VoltLabel } from 'volt';

/** Deliberately loose: the server is the one that decides; this only catches typos. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A newsletter sign-up band to close a page.
 *
 * A visible label, a hint that says what you are signing up for and how often, and an error that
 * appears only after a submit — all wired by `volt-form-field`, so the input is described by the hint
 * and the error without hand-written ids. After a valid submit the form is replaced by a confirmation
 * that takes focus (the button that had it is gone) inside a `role="status"` region rendered from the
 * start, so it is also announced.
 *
 * The envelope drifts slowly behind the copy; under reduced motion it stays put.
 */
@Component({
  selector: 'app-cta-newsletter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltError,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltLabel,
    LmnCheckIcon,
    LmnMailIcon,
  ],
  template: `
    <section class="@container bg-background px-4 py-16 @3xl:px-6">
      <div
        class="band relative mx-auto grid max-w-5xl gap-8 overflow-hidden rounded-2xl border border-border p-8 @3xl:grid-cols-2 @3xl:items-center @3xl:p-12"
      >
        <span class="envelope" aria-hidden="true"><lmn-mail [size]="32" /></span>

        <div class="relative">
          <h2 class="text-balance text-3xl font-bold tracking-tight">The Friday Field Notes</h2>
          <p class="mt-3 text-muted-foreground">
            One short email a week: what we shipped, what broke, and what we learned fixing it. Read
            by 18,000 engineers.
          </p>
        </div>

        <div class="relative">
          <div role="status">
            @if (subscribed()) {
              <div #done tabindex="-1" class="done flex items-start gap-3 outline-none">
                <span
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success text-success-foreground"
                  aria-hidden="true"
                >
                  <lmn-check [size]="16" />
                </span>
                <p class="text-sm">
                  <span class="block font-medium">Check your inbox.</span>
                  <span class="text-muted-foreground">
                    We sent a confirmation link to {{ email() }}.
                  </span>
                </p>
              </div>
            }
          </div>

          @if (!subscribed()) {
            <form novalidate (submit)="subscribe($event)">
              <volt-form-field>
                <volt-label>Email address</volt-label>
                <div class="flex flex-col gap-2 @md:flex-row">
                  <volt-input
                    type="email"
                    autocomplete="email"
                    placeholder="you@company.com"
                    class="flex-1"
                    [state]="error() ? 'error' : 'default'"
                    [value]="email()"
                    (valueChange)="edit($event)"
                  />
                  <volt-button type="submit">Subscribe</volt-button>
                </div>
                @if (error()) {
                  <volt-error>That address is missing an &#64; or a domain.</volt-error>
                } @else {
                  <volt-hint>Weekly. Unsubscribe with one click.</volt-hint>
                }
              </volt-form-field>
            </form>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .band {
      background:
        radial-gradient(
          120% 90% at 100% 0%,
          color-mix(in oklch, var(--primary) 12%, transparent),
          transparent 60%
        ),
        var(--card);
    }

    .envelope {
      position: absolute;
      right: 2.5rem;
      bottom: 1.5rem;
      /* The icon set stops at 32px; scale the mark rather than ship a second, larger icon. */
      scale: 5;
      color: color-mix(in oklch, var(--primary) 14%, transparent);
      rotate: -12deg;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: no-preference) {
      .envelope {
        animation: drift 9s ease-in-out infinite alternate;
      }
      .done {
        animation: rise 400ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
      }
    }

    @keyframes drift {
      to {
        translate: -0.75rem -0.75rem;
        rotate: -6deg;
      }
    }

    @keyframes rise {
      from {
        opacity: 0;
        translate: 0 0.5rem;
      }
    }
  `,
})
export class CtaNewsletter {
  private readonly injector = inject(Injector);
  private readonly done = viewChild<ElementRef<HTMLElement>>('done');

  protected readonly email = signal('');
  protected readonly error = signal(false);
  protected readonly subscribed = signal(false);

  protected edit(value: string): void {
    this.email.set(value);
    if (this.error() && EMAIL.test(value.trim())) this.error.set(false);
  }

  protected subscribe(event: Event): void {
    event.preventDefault();
    const email = this.email().trim();
    if (!EMAIL.test(email)) {
      this.error.set(true);
      return;
    }
    this.email.set(email);
    this.subscribed.set(true);
    afterNextRender(() => this.done()?.nativeElement.focus(), { injector: this.injector });
  }
}
