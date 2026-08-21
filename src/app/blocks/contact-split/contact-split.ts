import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import { LmnCheckIcon, LmnMailIcon, LmnMapPinIcon, LmnPhoneIcon, LmnSendIcon } from 'lumen-icons';
import {
  VoltButton,
  VoltInput,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltTextarea,
} from 'volt';

interface ContactMethod {
  readonly icon: 'mail' | 'phone' | 'pin';
  readonly label: string;
  readonly value: string;
  readonly note: string;
}

/**
 * Contact form beside the ways of reaching you that are not a form.
 *
 * The two halves are not decoration. A form alone tells a visitor who needs an answer
 * today that their only option is to fill it in and hope; putting the address, the phone
 * number and the actual response time next to it costs one column and removes that.
 *
 * Submitting swaps the form for a confirmation in place rather than navigating, and the
 * confirmation is focusable and announced — a success message that only changes some
 * pixels is invisible to anyone not looking at that part of the screen.
 */
@Component({
  selector: 'app-contact-split',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltInput,
    VoltTextarea,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltButton,
    LmnMailIcon,
    LmnPhoneIcon,
    LmnMapPinIcon,
    LmnSendIcon,
    LmnCheckIcon,
  ],
  template: `
    <section class="@container bg-background px-4 py-20 @2xl:px-6 @2xl:py-24">
      <div class="mx-auto grid max-w-6xl gap-12 @4xl:grid-cols-[0.9fr_1.1fr] @4xl:gap-16">
        <div class="min-w-0">
          <h2 class="text-balance text-3xl font-bold tracking-tight @2xl:text-4xl">
            Tell us what you are building.
          </h2>
          <p class="mt-4 max-w-md text-balance text-lg text-muted-foreground">
            A real person reads every message. If it is urgent, the phone number below is faster
            than this form.
          </p>

          <dl class="mt-10 space-y-6">
            @for (method of methods; track method.label) {
              <div class="flex gap-4">
                <dt class="sr-only">{{ method.label }}</dt>
                <span
                  class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  @switch (method.icon) {
                    @case ('mail') {
                      <lmn-mail [size]="16" />
                    }
                    @case ('phone') {
                      <lmn-phone [size]="16" />
                    }
                    @case ('pin') {
                      <lmn-map-pin [size]="16" />
                    }
                  }
                </span>
                <dd class="min-w-0">
                  <p class="font-medium">{{ method.value }}</p>
                  <p class="mt-0.5 text-sm text-muted-foreground">{{ method.note }}</p>
                </dd>
              </div>
            }
          </dl>
        </div>

        <div class="form-panel rounded-xl border border-border bg-surface p-6 @2xl:p-8">
          @if (sent()) {
            <!-- tabindex="-1" so the code can move focus here; role="status" so it is
                 announced without stealing focus from anyone who did not submit. -->
            <div
              #confirmation
              tabindex="-1"
              role="status"
              class="confirm flex min-h-[26rem] flex-col items-center justify-center text-center"
            >
              <span
                class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success"
              >
                <lmn-check [size]="24" />
              </span>
              <h3 class="mt-5 text-xl font-semibold tracking-tight">Message sent</h3>
              <p class="mt-2 max-w-xs text-sm text-muted-foreground">
                Thanks — we reply to everything within one business day, usually sooner.
              </p>
              <volt-button variant="outline" class="mt-6" (click)="reset()">
                Send another
              </volt-button>
            </div>
          } @else {
            <form class="space-y-5" (submit)="submit($event)">
              <div class="grid gap-5 @2xl:grid-cols-2">
                <div class="field">
                  <label class="field-label" for="contact-name">Name</label>
                  <volt-input
                    [id]="'contact-name'"
                    autocomplete="name"
                    placeholder="Ada Lovelace"
                  />
                </div>
                <div class="field">
                  <label class="field-label" for="contact-email">Email</label>
                  <volt-input
                    [id]="'contact-email'"
                    type="email"
                    autocomplete="email"
                    placeholder="ada@company.com"
                  />
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="contact-topic">Topic</label>
                <volt-select
                  [value]="topic()"
                  (valueChange)="onTopicChange($event)"
                  ariaLabel="Topic"
                  placeholder="Choose a topic"
                >
                  <volt-select-content>
                    @for (option of topics; track option.value) {
                      <volt-select-item [value]="option.value">{{ option.label }}</volt-select-item>
                    }
                  </volt-select-content>
                </volt-select>
              </div>

              <div class="field">
                <label class="field-label" for="contact-message">Message</label>
                <volt-textarea
                  [id]="'contact-message'"
                  [rows]="6"
                  placeholder="What are you working on, and what is in the way?"
                />
              </div>

              <div
                class="flex flex-col gap-4 pt-1 @md:flex-row @md:items-center @2xl:justify-between"
              >
                <p class="text-xs text-muted-foreground">
                  We never share your details. No newsletter unless you ask.
                </p>
                <volt-button type="submit" size="lg" class="group w-full @md:w-auto">
                  Send message
                  <lmn-send
                    slot="trailing"
                    [size]="16"
                    class="transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                  />
                </volt-button>
              </div>
            </form>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    /* The accent bar lives on a wrapper in this template rather than on the input, because
       an emulated-encapsulation style cannot reach inside volt-input's own template. Which
       is the right constraint anyway: the whole field lights up, label included. */
    .field {
      position: relative;
      padding-left: 0.875rem;
    }

    .field::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.1rem;
      bottom: 0.1rem;
      width: 2px;
      border-radius: 9999px;
      background: var(--primary);
      opacity: 0;
      scale: 1 0.4;
      transform-origin: top;
      transition:
        opacity 260ms cubic-bezier(0.22, 1, 0.36, 1),
        scale 260ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .field:focus-within::before {
      opacity: 1;
      scale: 1 1;
    }

    .field-label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--muted-foreground);
      transition: color 200ms ease;
    }

    .field:focus-within .field-label {
      color: var(--foreground);
    }

    .confirm {
      animation: confirm-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes confirm-in {
      from {
        opacity: 0;
        translate: 0 10px;
      }
      to {
        opacity: 1;
        translate: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .field::before,
      .field-label {
        transition: none;
      }

      .confirm {
        animation: none;
      }
    }
  `,
})
export class ContactSplit {
  private readonly confirmation = viewChild<ElementRef<HTMLElement>>('confirmation');

  protected readonly topic = signal<string>('');
  protected readonly sent = signal(false);

  constructor() {
    // The form is gone by the time this runs, so focus is sitting on <body> and the next
    // Tab would start from the top of the page. Moving it to the confirmation both
    // announces the result and leaves the visitor where they were.
    effect(() => this.confirmation()?.nativeElement.focus());
  }

  protected readonly topics = [
    { value: 'project', label: 'A new project' },
    { value: 'audit', label: 'An audit or review' },
    { value: 'support', label: 'Support on something we built' },
    { value: 'other', label: 'Something else' },
  ];

  protected readonly methods: readonly ContactMethod[] = [
    {
      icon: 'mail',
      label: 'Email',
      value: 'hello@example.com',
      note: 'Answered within one business day.',
    },
    {
      icon: 'phone',
      label: 'Phone',
      value: '+34 900 000 000',
      note: 'Weekdays, 9:00 to 18:00 CET.',
    },
    {
      icon: 'pin',
      label: 'Office',
      value: 'Carrer de Mallorca 401, Barcelona',
      note: 'Visits by appointment.',
    },
  ];

  protected onTopicChange(value: unknown): void {
    this.topic.set(typeof value === 'string' ? value : '');
  }

  /** Wire this to your own endpoint; the block only owns what the visitor sees. */
  protected submit(event: Event): void {
    event.preventDefault();
    this.sent.set(true);
  }

  protected reset(): void {
    this.sent.set(false);
    this.topic.set('');
  }
}
