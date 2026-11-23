import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { LmnArrowRightIcon, LmnCheckIcon } from 'lumen-icons';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltBadge,
  VoltButton,
  VoltError,
  VoltFormField,
  VoltInput,
  VoltLabel,
} from 'volt';

/** Deliberately loose: the server is the one that decides; this only catches typos. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * An opening section whose one job is to collect an email address.
 *
 * The form validates on submit, not on every keystroke — nobody wants to be told their address is
 * invalid while they are still typing it. Once it is sent the form is replaced by a confirmation
 * inside a `role="status"` region that exists from the first render, so screen readers announce the
 * change (a live region created at the same moment as its content is often skipped).
 *
 * The submit button goes away with the form, so focus moves to the confirmation rather than
 * falling back to the top of the page.
 *
 * The avatar stack fans out on hover. It is decoration with a real count beside it, so the faces are
 * `aria-hidden` and the sentence carries the number.
 */
@Component({
  selector: 'app-hero-waitlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltBadge,
    VoltButton,
    VoltError,
    VoltFormField,
    VoltInput,
    VoltLabel,
    LmnArrowRightIcon,
    LmnCheckIcon,
  ],
  template: `
    <section
      class="@container relative overflow-hidden bg-background px-4 py-24 @3xl:px-6 @3xl:py-32"
    >
      <div class="halo" aria-hidden="true"></div>

      <div class="relative mx-auto max-w-2xl text-center">
        <volt-badge variant="outline" class="gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true"></span>
          Private beta · spring cohort
        </volt-badge>

        <h1 class="mt-6 text-balance text-4xl font-bold tracking-tight @2xl:text-6xl">
          The release notes your team actually reads
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
          Changelog turns merged pull requests into one weekly digest, written for the people who
          were not in the review.
        </p>

        <div role="status" class="mx-auto mt-10 max-w-md">
          @if (joined()) {
            <div
              #confirm
              tabindex="-1"
              class="confirm flex items-center justify-center gap-3 text-left outline-none"
            >
              <span
                class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success text-success-foreground"
                aria-hidden="true"
              >
                <lmn-check [size]="20" />
              </span>
              <p class="text-sm">
                <span class="font-medium">You are on the list.</span>
                <span class="text-muted-foreground">
                  We will write to {{ email() }} when a seat opens.</span
                >
              </p>
            </div>
          }
        </div>

        @if (!joined()) {
          <form class="mx-auto -mt-px max-w-md text-left" novalidate (submit)="join($event)">
            <volt-form-field>
              <volt-label class="sr-only">Work email</volt-label>
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
                <volt-button type="submit" class="group shrink-0">
                  Join the waitlist
                  <lmn-arrow-right
                    slot="trailing"
                    [size]="16"
                    class="transition-transform motion-safe:group-hover:translate-x-0.5"
                  />
                </volt-button>
              </div>
              @if (error()) {
                <volt-error>Enter an address like name&#64;company.com.</volt-error>
              }
            </volt-form-field>
          </form>
        }

        <div class="faces mt-8 flex items-center justify-center gap-3">
          <div class="stack flex" aria-hidden="true">
            @for (person of people; track person) {
              <volt-avatar class="face h-8 w-8 ring-2 ring-background">
                <volt-avatar-fallback class="text-[11px]">{{ person }}</volt-avatar-fallback>
              </volt-avatar>
            }
          </div>
          <p class="text-sm text-muted-foreground">
            <span class="font-medium text-foreground">{{ waiting().toLocaleString('en') }}</span>
            people are already waiting
          </p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .halo {
      position: absolute;
      inset: -40% -10% auto;
      height: 80%;
      background: radial-gradient(
        closest-side,
        color-mix(in oklch, var(--primary) 18%, transparent),
        transparent
      );
      pointer-events: none;
    }

    .face + .face {
      margin-left: -0.4rem;
      transition: margin 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    @media (hover: hover) and (prefers-reduced-motion: no-preference) {
      .faces:hover .face + .face {
        margin-left: 0.15rem;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .confirm {
        animation: rise 400ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
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
export class HeroWaitlist {
  private readonly injector = inject(Injector);
  private readonly confirm = viewChild<ElementRef<HTMLElement>>('confirm');

  protected readonly people = ['AK', 'MR', 'JL', 'SO', 'TV'];

  protected readonly email = signal('');
  protected readonly error = signal(false);
  protected readonly joined = signal(false);

  private readonly base = 2418;
  protected readonly waiting = computed(() => this.base + (this.joined() ? 1 : 0));

  protected edit(value: string): void {
    this.email.set(value);
    // Clear the message as soon as the address becomes valid, but never raise it while typing.
    if (this.error() && EMAIL.test(value.trim())) this.error.set(false);
  }

  protected join(event: Event): void {
    event.preventDefault();
    const email = this.email().trim();
    if (!EMAIL.test(email)) {
      this.error.set(true);
      return;
    }
    this.email.set(email);
    this.joined.set(true);
    afterNextRender(() => this.confirm()?.nativeElement.focus(), { injector: this.injector });
  }
}
