import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';
import { LmnSendIcon } from 'lumen-icons';
import { VoltAvatar, VoltAvatarFallback, VoltBadge, VoltButton, VoltInput } from 'volt';

interface Conversation {
  readonly name: string;
  readonly initials: string;
  readonly preview: string;
  readonly when: string;
  readonly unread?: number;
  readonly active?: boolean;
}

interface Message {
  readonly from: 'them' | 'me';
  readonly body: string;
  readonly when: string;
}

/**
 * Chat: three regions, three different scroll behaviours.
 *
 * That is the entire reason this layout is worth copying. The conversation list scrolls
 * on its own; the thread scrolls on its own and starts at the bottom, because a
 * conversation you open halfway up is a conversation you have to scroll before you can
 * read it; and the composer never moves, because a composer that scrolls away is one you
 * hunt for every time you want to reply.
 *
 * Each scrolling region is a flex child with `min-h-0`. Without it a flex item refuses to
 * shrink below its content, the panes grow instead of scrolling, and the composer is
 * pushed off the bottom of the screen.
 *
 * Scrolling the thread to the bottom happens in `afterNextRender`, which never runs on the
 * server — there is no scroll position to set during server rendering, and reaching for
 * the element there would fail.
 */
@Component({
  selector: 'app-chat-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltAvatar, VoltAvatarFallback, VoltBadge, VoltButton, VoltInput, LmnSendIcon],
  template: `
    <div class="flex h-[640px] overflow-hidden bg-background">
      <!-- Conversation list: its own scroller, hidden on narrow screens where the thread
           takes the whole width. -->
      <aside class="hidden w-72 shrink-0 flex-col border-r border-border md:flex">
        <div class="shrink-0 border-b border-border p-3">
          <volt-input placeholder="Search conversations" ariaLabel="Search conversations" />
        </div>

        <ul class="min-h-0 flex-1 overflow-y-auto">
          @for (conversation of conversations; track conversation.name) {
            <li>
              <button
                type="button"
                class="flex w-full items-start gap-3 border-b border-border/60 p-3 text-left transition-colors hover:bg-muted/60"
                [class]="conversation.active ? 'bg-muted' : ''"
                [attr.aria-current]="conversation.active ? 'true' : null"
              >
                <volt-avatar class="h-9 w-9 shrink-0">
                  <volt-avatar-fallback class="text-xs">
                    {{ conversation.initials }}
                  </volt-avatar-fallback>
                </volt-avatar>

                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline justify-between gap-2">
                    <span class="truncate text-sm font-medium">{{ conversation.name }}</span>
                    <span class="shrink-0 text-[11px] text-muted-foreground">
                      {{ conversation.when }}
                    </span>
                  </div>
                  <p class="mt-0.5 truncate text-xs text-muted-foreground">
                    {{ conversation.preview }}
                  </p>
                </div>

                @if (conversation.unread) {
                  <volt-badge class="mt-1 shrink-0 tabular-nums">
                    {{ conversation.unread }}
                  </volt-badge>
                }
              </button>
            </li>
          }
        </ul>
      </aside>

      <section class="flex min-w-0 flex-1 flex-col">
        <header class="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <volt-avatar class="h-9 w-9">
            <volt-avatar-fallback class="text-xs">DO</volt-avatar-fallback>
          </volt-avatar>
          <div class="min-w-0">
            <h1 class="truncate text-sm font-medium">Dan Okoro</h1>
            <p class="text-xs text-muted-foreground">Active now</p>
          </div>
        </header>

        <!-- The thread. min-h-0 is what makes this the scroller instead of the page. -->
        <div #thread class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          @for (message of messages; track message.when) {
            <div class="flex" [class]="message.from === 'me' ? 'justify-end' : 'justify-start'">
              <div
                class="max-w-[75%] rounded-lg px-3 py-2 text-sm leading-relaxed"
                [class]="
                  message.from === 'me'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                "
              >
                <p>{{ message.body }}</p>
                <p
                  class="mt-1 text-[10px]"
                  [class]="
                    message.from === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  "
                >
                  {{ message.when }}
                </p>
              </div>
            </div>
          }
        </div>

        <!-- The composer. Outside the scroller, so it stays where it is. -->
        <form
          class="flex shrink-0 items-center gap-2 border-t border-border p-3"
          (submit)="$event.preventDefault()"
        >
          <label class="sr-only" for="chat-message">Message</label>
          <volt-input [id]="'chat-message'" class="flex-1" placeholder="Write a message…" />
          <volt-button type="submit" size="icon" aria-label="Send">
            <lmn-send [size]="16" />
          </volt-button>
        </form>
      </section>
    </div>
  `,
})
export class ChatLayout {
  private readonly thread = viewChild.required<ElementRef<HTMLElement>>('thread');

  constructor() {
    // A conversation opens at its newest message, not its oldest.
    afterNextRender(() => {
      const element = this.thread().nativeElement;
      element.scrollTop = element.scrollHeight;
    });
  }

  protected readonly conversations: readonly Conversation[] = [
    {
      name: 'Dan Okoro',
      initials: 'DO',
      preview: 'That fixes it — merging now.',
      when: '09:41',
      active: true,
    },
    {
      name: 'Platform team',
      initials: 'PT',
      preview: 'Marta: rollback finished, we are green.',
      when: '09:12',
      unread: 3,
    },
    {
      name: 'Priya Raman',
      initials: 'PR',
      preview: 'Can you look at the token drift?',
      when: 'Yesterday',
    },
    {
      name: 'Tomás Vidal',
      initials: 'TV',
      preview: 'Sent the audit over.',
      when: 'Yesterday',
    },
    { name: 'Sasha Lund', initials: 'SL', preview: 'Thanks!', when: 'Monday' },
  ];

  protected readonly messages: readonly Message[] = [
    { from: 'them', body: 'The gallery is duplicating a section after hydration.', when: '09:31' },
    { from: 'me', body: 'Only in dev, or in the build too?', when: '09:33' },
    {
      from: 'them',
      body: 'Dev. The build is clean, which is why nobody caught it.',
      when: '09:34',
    },
    {
      from: 'me',
      body: 'Then it is a mismatch the production recovery hides. Nested anchors, probably — the cards wrap whole blocks.',
      when: '09:38',
    },
    { from: 'them', body: 'That fixes it — merging now.', when: '09:41' },
  ];
}
