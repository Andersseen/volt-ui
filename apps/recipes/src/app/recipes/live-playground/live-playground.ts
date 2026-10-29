import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LmnCheckIcon, LmnCopyIcon, LmnRefreshCwIcon } from 'lumen-icons';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltButton,
  VoltInput,
  VoltSwitch,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';

type Variant = 'default' | 'info' | 'success' | 'warning' | 'destructive';
type Announce = 'none' | 'status' | 'alert';

interface PlaygroundState {
  readonly variant: Variant;
  readonly title: string;
  readonly description: string;
  readonly announce: Announce;
  readonly action: boolean;
}

const INITIAL: PlaygroundState = {
  variant: 'info',
  title: 'Heads up',
  description: 'Your trial ends in three days.',
  announce: 'none',
  action: true,
};

const VARIANTS: readonly Variant[] = ['default', 'info', 'success', 'warning', 'destructive'];
const ANNOUNCE: readonly Announce[] = ['none', 'status', 'alert'];

/** Text that is safe to paste into an Angular template: no stray `{`, `}`, `@` or `<`. */
const escapeText = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/@/g, '&#64;');

/**
 * Controls → state → preview → code.
 *
 * One signal holds every setting. The live `<volt-alert>` reads it, and so does `code`, a
 * `computed` that prints the template a consumer would write for those same settings — so the
 * snippet cannot describe something other than what is on screen. Only non-default values are
 * printed, which keeps the code the shortest one that reproduces the preview.
 *
 * This is one composition for one component, not an editor framework: to point it at another
 * component, change `PlaygroundState`, the controls and `code`.
 */
@Component({
  selector: 'app-live-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LmnCheckIcon,
    LmnCopyIcon,
    LmnRefreshCwIcon,
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltButton,
    VoltInput,
    VoltSwitch,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
  host: { class: 'block' },
  template: `
    <div class="@container">
      <div class="grid gap-6 @3xl:grid-cols-[18rem_1fr]">
        <form class="space-y-5" aria-label="Alert settings" (submit)="$event.preventDefault()">
          <fieldset class="space-y-2">
            <legend class="text-sm font-medium">Variant</legend>
            <volt-toggle-group
              class="flex-wrap"
              type="single"
              [allowDeselection]="false"
              [value]="[state().variant]"
              (valueChange)="pick('variant', $event, variants)"
              aria-label="Variant"
            >
              @for (variant of variants; track variant) {
                <volt-toggle-group-item [value]="variant" size="sm">{{
                  variant
                }}</volt-toggle-group-item>
              }
            </volt-toggle-group>
          </fieldset>

          <div class="space-y-1.5">
            <label for="pg-title" class="text-sm font-medium">Title</label>
            <volt-input
              id="pg-title"
              [value]="state().title"
              (valueChange)="patch({ title: $event })"
            />
          </div>

          <div class="space-y-1.5">
            <label for="pg-description" class="text-sm font-medium">Description</label>
            <volt-input
              id="pg-description"
              [value]="state().description"
              (valueChange)="patch({ description: $event })"
            />
          </div>

          <fieldset class="space-y-2">
            <legend class="text-sm font-medium">Announce</legend>
            <volt-toggle-group
              type="single"
              [allowDeselection]="false"
              [value]="[state().announce]"
              (valueChange)="pick('announce', $event, announce)"
              aria-label="Announce"
            >
              @for (option of announce; track option) {
                <volt-toggle-group-item [value]="option" size="sm">{{
                  option
                }}</volt-toggle-group-item>
              }
            </volt-toggle-group>
          </fieldset>

          <div class="flex items-center justify-between gap-3">
            <label for="pg-action" class="text-sm font-medium">Action button</label>
            <volt-switch
              id="pg-action"
              [checked]="state().action"
              (checkedChange)="patch({ action: $event })"
            />
          </div>

          <volt-button variant="outline" size="sm" (click)="reset()">
            <lmn-refresh-cw slot="leading" [size]="14" />
            Reset
          </volt-button>
        </form>

        <div class="min-w-0 space-y-4">
          <div class="rounded-xl border border-border bg-muted/20 p-6">
            <p class="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preview
            </p>
            <volt-alert [variant]="state().variant" [role]="role()">
              <volt-alert-title>{{ state().title }}</volt-alert-title>
              <volt-alert-description>{{ state().description }}</volt-alert-description>
              @if (state().action) {
                <volt-button slot="action" size="sm" variant="outline">Upgrade</volt-button>
              }
            </volt-alert>
          </div>

          <div class="overflow-hidden rounded-xl border border-border">
            <div class="flex items-center justify-between border-b border-border px-4 py-2">
              <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Code</p>
              <volt-button size="sm" variant="ghost" (click)="copy()">
                @if (copied() === 'copied') {
                  <lmn-check slot="leading" [size]="14" />
                } @else {
                  <lmn-copy slot="leading" [size]="14" />
                }
                {{
                  copied() === 'copied'
                    ? 'Copied'
                    : copied() === 'failed'
                      ? 'Copy failed'
                      : 'Copy code'
                }}
              </volt-button>
            </div>
            <pre
              class="overflow-x-auto p-4 font-mono text-[13px] leading-6"
              tabindex="0"
              aria-label="Generated code"
            ><code>{{ code() }}</code></pre>
            <span class="sr-only" role="status">{{
              copied() === 'copied' ? 'Code copied' : ''
            }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LivePlayground {
  protected readonly variants = VARIANTS;
  protected readonly announce = ANNOUNCE;

  protected readonly state = signal<PlaygroundState>(INITIAL);
  protected readonly copied = signal<'idle' | 'copied' | 'failed'>('idle');

  protected readonly role = computed(() => {
    const announce = this.state().announce;
    return announce === 'none' ? null : announce;
  });

  /** The template a consumer writes for the settings above — read from the same `state`. */
  protected readonly code = computed(() => {
    const { variant, title, description, announce, action } = this.state();
    const attrs = [
      variant !== 'default' ? `variant="${variant}"` : '',
      announce !== 'none' ? `role="${announce}"` : '',
    ].filter(Boolean);
    const open = attrs.length ? `<volt-alert ${attrs.join(' ')}>` : '<volt-alert>';
    return [
      open,
      `  <volt-alert-title>${escapeText(title)}</volt-alert-title>`,
      `  <volt-alert-description>${escapeText(description)}</volt-alert-description>`,
      ...(action
        ? [`  <volt-button slot="action" size="sm" variant="outline">Upgrade</volt-button>`]
        : []),
      '</volt-alert>',
    ].join('\n');
  });

  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected patch(change: Partial<PlaygroundState>): void {
    this.state.update(state => ({ ...state, ...change }));
  }

  /** A single-selection group reports `[]` when deselected; ignore anything outside `allowed`. */
  protected pick<K extends 'variant' | 'announce'>(
    key: K,
    value: readonly string[],
    allowed: readonly PlaygroundState[K][]
  ): void {
    const next = allowed.find(option => option === value[0]);
    if (next) this.patch({ [key]: next } as Partial<PlaygroundState>);
  }

  protected reset(): void {
    this.state.set(INITIAL);
  }

  protected async copy(): Promise<void> {
    let result: 'copied' | 'failed' = 'copied';
    try {
      await navigator.clipboard.writeText(this.code());
    } catch {
      // Insecure context or a denied permission: say so instead of pretending.
      result = 'failed';
    }
    this.copied.set(result);
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copied.set('idle'), 1800);
  }
}
