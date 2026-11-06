import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LmnCheckIcon, LmnCopyIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltButton,
  VoltSpinner,
  VoltSwitch,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';

type ComponentId = 'button' | 'badge' | 'switch';

interface ExplorerSpec {
  readonly id: ComponentId;
  readonly label: string;
  /** Empty when the component has no visual variants. */
  readonly variants: readonly string[];
  readonly states: readonly string[];
}

/** What can be explored. Adding a component is one entry here, one `@case` and one `usage` branch. */
const SPECS: readonly ExplorerSpec[] = [
  {
    id: 'button',
    label: 'Button',
    variants: ['solid', 'outline', 'ghost', 'destructive', 'link'],
    states: ['default', 'disabled', 'loading'],
  },
  {
    id: 'badge',
    label: 'Badge',
    variants: ['solid', 'secondary', 'outline', 'success', 'warning', 'destructive'],
    states: [],
  },
  { id: 'switch', label: 'Switch', variants: [], states: ['enabled', 'disabled'] },
];

/**
 * Pick a component, pick a variant, pick a state: see it, poke it, copy the code.
 *
 * `variant` and `stateId` are the only things the user changes; the preview and `usage` are
 * both read from them (and from the active `spec`), so they cannot disagree. The preview is the
 * real Volt component, including its behaviour — the button counts presses, the switch toggles —
 * which is what separates this from a screenshot gallery. It is deliberately not Storybook: no
 * docs, no args table, three components.
 */
@Component({
  selector: 'app-component-explorer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LmnCheckIcon,
    LmnCopyIcon,
    VoltBadge,
    VoltButton,
    VoltSpinner,
    VoltSwitch,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
  host: { class: 'block' },
  template: `
    <div class="space-y-5">
      <volt-toggle-group
        type="single"
        [allowDeselection]="false"
        [value]="[componentId()]"
        (valueChange)="selectComponent($event)"
        aria-label="Component"
      >
        @for (item of specs; track item.id) {
          <volt-toggle-group-item [value]="item.id">{{ item.label }}</volt-toggle-group-item>
        }
      </volt-toggle-group>

      <div class="grid gap-5 md:grid-cols-[1fr_1.1fr]">
        <div class="space-y-4">
          @if (spec().variants.length) {
            <fieldset class="space-y-2">
              <legend class="text-sm font-medium">Variant</legend>
              <volt-toggle-group
                class="flex-wrap"
                type="single"
                [allowDeselection]="false"
                [value]="[variant()]"
                (valueChange)="selectVariant($event)"
                aria-label="Variant"
              >
                @for (item of spec().variants; track item) {
                  <volt-toggle-group-item [value]="item" size="sm">{{
                    item
                  }}</volt-toggle-group-item>
                }
              </volt-toggle-group>
            </fieldset>
          }

          @if (spec().states.length) {
            <fieldset class="space-y-2">
              <legend class="text-sm font-medium">State</legend>
              <volt-toggle-group
                type="single"
                [allowDeselection]="false"
                [value]="[stateId()]"
                (valueChange)="selectState($event)"
                aria-label="State"
              >
                @for (item of spec().states; track item) {
                  <volt-toggle-group-item [value]="item" size="sm">{{
                    item
                  }}</volt-toggle-group-item>
                }
              </volt-toggle-group>
            </fieldset>
          }

          <div
            class="flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted/20 p-6"
          >
            @switch (spec().id) {
              @case ('button') {
                <volt-button
                  [variant]="buttonVariant()"
                  [disabled]="stateId() !== 'default'"
                  (click)="presses.set(presses() + 1)"
                >
                  @if (stateId() === 'loading') {
                    <volt-spinner slot="leading" size="sm" label="Loading" />
                  }
                  {{ stateId() === 'loading' ? 'Saving' : 'Save changes' }}
                </volt-button>
                <p class="text-xs text-muted-foreground" role="status">
                  Pressed {{ presses() }} {{ presses() === 1 ? 'time' : 'times' }}
                </p>
              }
              @case ('badge') {
                <volt-badge [variant]="badgeVariant()">New release</volt-badge>
              }
              @case ('switch') {
                <volt-switch
                  [checked]="switchOn()"
                  [disabled]="stateId() === 'disabled'"
                  (checkedChange)="switchOn.set($event)"
                  ariaLabel="Notifications"
                />
                <p class="text-xs text-muted-foreground" role="status">
                  Notifications {{ switchOn() ? 'on' : 'off' }}
                </p>
              }
            }
          </div>
        </div>

        <div class="min-w-0 overflow-hidden rounded-xl border border-border">
          <div class="flex items-center justify-between border-b border-border px-4 py-2">
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Usage</p>
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
            aria-label="Usage code"
          ><code>{{ usage() }}</code></pre>
        </div>
      </div>
    </div>
  `,
})
export class ComponentExplorer {
  protected readonly specs = SPECS;

  protected readonly componentId = signal<ComponentId>('button');
  /** Per component, so switching away and back keeps what you chose. */
  private readonly variants = signal<Partial<Record<ComponentId, string>>>({});
  private readonly states = signal<Partial<Record<ComponentId, string>>>({});

  protected readonly presses = signal(0);
  protected readonly switchOn = signal(false);
  protected readonly copied = signal<'idle' | 'copied' | 'failed'>('idle');

  protected readonly spec = computed(
    () => SPECS.find(item => item.id === this.componentId()) ?? SPECS[0]
  );
  protected readonly variant = computed(
    () => this.variants()[this.spec().id] ?? this.spec().variants[0] ?? ''
  );
  protected readonly stateId = computed(
    () => this.states()[this.spec().id] ?? this.spec().states[0] ?? ''
  );

  // The union types of the real inputs; narrowed here so the template binds without casts.
  protected readonly buttonVariant = computed(
    () => this.variant() as 'solid' | 'outline' | 'ghost' | 'destructive' | 'link'
  );
  protected readonly badgeVariant = computed(
    () =>
      this.variant() as 'solid' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'
  );

  /** The template a consumer writes for what is on screen — read from the same signals. */
  protected readonly usage = computed(() => {
    const variant = this.variant();
    const state = this.stateId();
    switch (this.spec().id) {
      case 'button': {
        const attrs = [
          variant !== 'solid' ? `variant="${variant}"` : '',
          state !== 'default' ? 'disabled' : '',
        ].filter(Boolean);
        const open = attrs.length ? `<volt-button ${attrs.join(' ')}>` : '<volt-button>';
        return state === 'loading'
          ? `${open}\n  <volt-spinner slot="leading" size="sm" label="Loading" />\n  Saving\n</volt-button>`
          : `${open}Save changes</volt-button>`;
      }
      case 'badge':
        return variant === 'solid'
          ? '<volt-badge>New release</volt-badge>'
          : `<volt-badge variant="${variant}">New release</volt-badge>`;
      case 'switch': {
        const attrs = [
          this.switchOn() ? '[checked]="true"' : '',
          state === 'disabled' ? 'disabled' : '',
          'ariaLabel="Notifications"',
        ].filter(Boolean);
        return `<volt-switch ${attrs.join(' ')} />`;
      }
    }
  });

  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected selectComponent(value: readonly string[]): void {
    const next = SPECS.find(item => item.id === value[0]);
    if (next) this.componentId.set(next.id);
  }

  protected selectVariant(value: readonly string[]): void {
    const next = this.spec().variants.find(item => item === value[0]);
    if (next) this.variants.update(all => ({ ...all, [this.spec().id]: next }));
  }

  protected selectState(value: readonly string[]): void {
    const next = this.spec().states.find(item => item === value[0]);
    if (next) this.states.update(all => ({ ...all, [this.spec().id]: next }));
  }

  protected async copy(): Promise<void> {
    let result: 'copied' | 'failed' = 'copied';
    try {
      await navigator.clipboard.writeText(this.usage());
    } catch {
      result = 'failed';
    }
    this.copied.set(result);
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copied.set('idle'), 1800);
  }
}
