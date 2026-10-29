import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { LmnArrowRightIcon } from 'lumen-icons';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';

type Tone = 'info' | 'success' | 'warning' | 'destructive';

/** The one value both halves are built from. */
export interface Notice {
  readonly id: string;
  readonly label: string;
  readonly tone: Tone;
  readonly title: string;
  readonly message: string;
  readonly action?: string;
}

const DEFAULT_NOTICES: readonly Notice[] = [
  {
    id: 'deploy',
    label: 'Deploy',
    tone: 'success',
    title: 'Deployed to production',
    message: 'Build 482 is live in 14 regions.',
    action: 'View release',
  },
  {
    id: 'quota',
    label: 'Quota',
    tone: 'warning',
    title: 'Usage at 92%',
    message: 'You will reach your plan limit in about two days.',
    action: 'Upgrade plan',
  },
  {
    id: 'outage',
    label: 'Outage',
    tone: 'destructive',
    title: 'Payments are degraded',
    message: 'We are investigating failed card charges.',
  },
];

interface Token {
  readonly text: string;
  readonly kind: 'key' | 'string' | 'punct';
}

/**
 * Source on one side, the result it produces on the other — both read from one `Notice`.
 *
 * The code is *derived* from the notice (`lines`) and the card is rendered from the same
 * notice, so what you read is what you see by construction; there is no second copy to drift.
 * Nothing here knows about any docs engine: swap `notices` for your own shape and renderer.
 *
 * The source is real text in a `<pre><code>`, so it can be selected, copied and read by
 * assistive technology; the colours are only a second channel for the key/value split. The
 * result is a polite live region, announced when a different notice is picked. The halves sit
 * side by side from `@3xl` and stack (source on top, arrow turned down) below it.
 */
@Component({
  selector: 'app-source-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LmnArrowRightIcon,
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
  host: { class: 'block' },
  template: `
    <section class="@container bg-background px-4 py-16 @2xl:px-6 @2xl:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="max-w-xl">
          <p class="text-sm font-medium uppercase tracking-wider text-primary">{{ eyebrow() }}</p>
          <h2 class="mt-3 text-balance text-3xl font-bold tracking-tight @2xl:text-4xl">
            {{ heading() }}
          </h2>
        </div>

        <volt-toggle-group
          class="mt-8"
          type="single"
          [allowDeselection]="false"
          [value]="[current().id]"
          (valueChange)="select($event)"
          aria-label="Example notices"
        >
          @for (notice of notices(); track notice.id) {
            <volt-toggle-group-item [value]="notice.id">{{ notice.label }}</volt-toggle-group-item>
          }
        </volt-toggle-group>

        <div class="mt-6 grid items-stretch gap-4 @3xl:grid-cols-[1fr_auto_1fr]">
          <volt-card class="overflow-hidden">
            <div class="flex items-center justify-between border-b border-border px-4 py-2.5">
              <volt-badge variant="secondary" class="font-mono">notice.ts</volt-badge>
              <span class="text-xs text-muted-foreground">Source</span>
            </div>
            <pre
              class="overflow-x-auto p-4 font-mono text-[13px] leading-6"
              tabindex="0"
              aria-label="Notice source"
            ><code>@for (line of lines(); track $index) {<span class="block">@for (token of line; track $index) {<span [class]="color(token.kind)">{{ token.text }}</span>}</span>}</code></pre>
          </volt-card>

          <div class="flex items-center justify-center text-muted-foreground" aria-hidden="true">
            <lmn-arrow-right [size]="24" class="rotate-90 @3xl:rotate-0" />
          </div>

          <volt-card class="flex flex-col overflow-hidden bg-muted/30">
            <div class="flex items-center justify-between border-b border-border px-4 py-2.5">
              <volt-badge variant="secondary" class="font-mono">{{ current().tone }}</volt-badge>
              <span class="text-xs text-muted-foreground">Result</span>
            </div>
            <div class="flex flex-1 items-center p-4" aria-live="polite">
              <!-- Re-keyed by id so the entrance replays when the notice changes. -->
              @for (notice of [current()]; track notice.id) {
                <volt-alert [variant]="notice.tone" class="swap w-full">
                  <volt-alert-title>{{ notice.title }}</volt-alert-title>
                  <volt-alert-description>{{ notice.message }}</volt-alert-description>
                  @if (notice.action) {
                    <volt-button slot="action" size="sm" variant="outline">
                      {{ notice.action }}
                    </volt-button>
                  }
                </volt-alert>
              }
            </div>
          </volt-card>
        </div>
      </div>
    </section>
  `,
  styles: `
    @media (prefers-reduced-motion: no-preference) {
      .swap {
        animation: swap 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
    }

    @keyframes swap {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
    }
  `,
})
export class SourcePreview {
  readonly eyebrow = input('Source to result');
  readonly heading = input('Read the config. See the component.');
  readonly notices = input<readonly Notice[]>(DEFAULT_NOTICES);
  /** Id of the notice on show; bindable as `[(selected)]`. Falls back to the first notice. */
  readonly selected = model<string | undefined>(undefined);

  protected readonly current = computed(() => {
    const notices = this.notices();
    return notices.find(notice => notice.id === this.selected()) ?? notices[0];
  });

  /** The source text, as lines of tokens, generated from the notice being rendered. */
  protected readonly lines = computed<readonly (readonly Token[])[]>(() => {
    const { tone, title, message, action } = this.current();
    const field = (key: string, value: string): Token[] => [
      { text: '  ', kind: 'punct' },
      { text: key, kind: 'key' },
      { text: ': ', kind: 'punct' },
      { text: `'${value}'`, kind: 'string' },
      { text: ',', kind: 'punct' },
    ];
    return [
      [{ text: 'const notice = {', kind: 'punct' }],
      field('tone', tone),
      field('title', title),
      field('message', message),
      ...(action ? [field('action', action)] : []),
      [{ text: '};', kind: 'punct' }],
    ];
  });

  protected select(value: readonly string[]): void {
    if (value[0]) this.selected.set(value[0]);
  }

  protected color(kind: Token['kind']): string {
    if (kind === 'key') return 'text-primary';
    return kind === 'string' ? 'text-foreground' : 'text-muted-foreground';
  }
}
