import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LmnMailIcon, LmnMessageCircleIcon, LmnSearchIcon } from 'lumen-icons';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltInput,
  VoltNativeButton,
  VoltSearch,
} from 'volt';

interface Question {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/**
 * Frequently asked questions with a search over them, and a way to reach a person when the answer
 * is not there.
 *
 * The accordion is Volt's, so the triggers are real buttons with `aria-expanded`, arrow keys move
 * between them and the panels are labelled by their question. The search filters on question and
 * answer text as you type; the result count lives in a polite live region, so a screen reader hears
 * "2 questions" without the focus leaving the field. With no match the list is replaced by an empty
 * state whose one action is the same as the side card's: ask us.
 */
@Component({
  selector: 'app-contact-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAccordion,
    VoltAccordionContent,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltInput,
    VoltNativeButton,
    VoltSearch,
    LmnMailIcon,
    LmnMessageCircleIcon,
    LmnSearchIcon,
  ],
  template: `
    <section class="@container bg-background px-4 py-20 @3xl:px-6">
      <div class="mx-auto grid max-w-5xl gap-10 @4xl:grid-cols-[1fr_18rem]">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Questions, answered</h2>
          <p class="mt-2 text-muted-foreground">
            The ones we hear every week. Search them before you write.
          </p>

          <volt-search class="relative mt-6 block">
            <lmn-search
              [size]="16"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <volt-input
              type="search"
              class="pl-9"
              placeholder="Search questions"
              ariaLabel="Search questions"
              [value]="query()"
              (valueChange)="query.set($event)"
            />
          </volt-search>
          <p class="mt-2 text-xs text-muted-foreground" aria-live="polite">
            {{ matches().length }} {{ matches().length === 1 ? 'question' : 'questions' }}
          </p>

          @if (matches().length) {
            <volt-accordion type="single" collapsible class="mt-4">
              @for (item of matches(); track item.id) {
                <volt-accordion-item [value]="item.id">
                  <volt-accordion-trigger>{{ item.question }}</volt-accordion-trigger>
                  <volt-accordion-content>
                    <p class="leading-7 text-muted-foreground">{{ item.answer }}</p>
                  </volt-accordion-content>
                </volt-accordion-item>
              }
            </volt-accordion>
          } @else {
            <volt-empty-state class="mt-4 rounded-xl border border-dashed border-border py-12">
              <volt-empty-state-title
                >Nothing about “{{ query().trim() }}” yet</volt-empty-state-title
              >
              <volt-empty-state-description>
                Ask us directly — the good questions end up on this list.
              </volt-empty-state-description>
              <a voltButton variant="outline" size="sm" class="mt-4" href="mailto:help@example.com">
                Ask the team
              </a>
            </volt-empty-state>
          }
        </div>

        <volt-card class="self-start p-6">
          <span
            class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <lmn-message-circle [size]="20" />
          </span>
          <h3 class="mt-4 font-semibold">Still stuck?</h3>
          <p class="mt-1 text-sm leading-6 text-muted-foreground">
            A person reads every message. We reply within a working day.
          </p>
          <volt-badge variant="secondary" class="mt-3">Median reply: 3 h</volt-badge>
          <div class="mt-5 grid gap-2">
            <volt-button class="w-full">Start a chat</volt-button>
            <a voltButton variant="outline" class="w-full" href="mailto:help@example.com">
              <lmn-mail [size]="16" aria-hidden="true" />
              help&#64;example.com
            </a>
          </div>
        </volt-card>
      </div>
    </section>
  `,
})
export class ContactFaq {
  protected readonly questions: readonly Question[] = [
    {
      id: 'trial',
      question: 'Is there a free trial?',
      answer:
        'Every plan starts with fourteen days free, no card needed. You keep your data after.',
    },
    {
      id: 'cancel',
      question: 'Can I cancel at any time?',
      answer: 'Yes. Cancelling stops the next charge; you keep access until the period ends.',
    },
    {
      id: 'export',
      question: 'How do I export my data?',
      answer: 'Settings → Data → Export gives you every record as CSV or JSON, whenever you want.',
    },
    {
      id: 'seats',
      question: 'Do guests count as seats?',
      answer: 'No. Guests can view and comment for free; only people who edit use a seat.',
    },
    {
      id: 'security',
      question: 'Where is my data stored?',
      answer: 'In the EU or US region you pick at sign-up, encrypted at rest and in transit.',
    },
  ];

  protected readonly query = signal('');

  protected readonly matches = computed(() => {
    const words = this.query().trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return this.questions;
    return this.questions.filter(item => {
      const text = `${item.question} ${item.answer}`.toLowerCase();
      return words.every(word => text.includes(word));
    });
  });
}
