import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  untracked,
} from '@angular/core';
import { TabsDirective } from '@quartz-headless/primitives';
import { cn } from '../../utils';

/*
 * Quartz Headless backend for `volt-tabs`; same public contract as the ng-primitives one.
 *
 * Volt owns `value` (`string | undefined`; a static value is the initial selection, `[(value)]`
 * keeps it in sync). Two Quartz behaviours differ from that contract and meet here and only here:
 *  - Quartz selects the first tab by writing its own `value`. Volt, like ng-primitives, only
 *    *shows* the first tab while `value` is undefined and never emits for it. Quartz's value
 *    reaches the model only after a user action (`userSelected`, `onKeydown`).
 *  - Quartz replaces a removed selected tab's value with the first tab's. Volt keeps `value` and
 *    selects it again when that tab returns (`tabRegistered`).
 * `activateOnFocus` has no input to map to: Quartz's `activationMode` is a signal input that only
 * a template can bind, and a host directive cannot be bound from its host's own bindings. Quartz
 * therefore always runs 'automatic', and with `activateOnFocus` off the wrapper puts the selection
 * back in the same keydown, before anything is rendered, so focus moves and selection does not.
 */
@Component({
  selector: 'volt-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
  },
  hostDirectives: [
    {
      directive: TabsDirective,
      inputs: ['orientation'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltTabs {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('w-full block', this.class()));

  private readonly tabs = inject(TabsDirective, { self: true });

  readonly value = model<string | undefined>(undefined);
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly activateOnFocus = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** The selection Quartz showed when the wrapper last looked; a keyboard move is a difference from it. */
  private settled: string | null = null;

  constructor() {
    effect(() => {
      const next = this.value();
      untracked(() => {
        // `undefined` leaves Quartz's implicit first-tab selection alone.
        if (next !== undefined && this.tabs.value() !== next) this.tabs.value.set(next);
      });
    });
    effect(() => {
      this.settled = this.tabs.value();
    });
  }

  /** A trigger was clicked or activated from the keyboard. */
  userSelected(value: string): void {
    if (this.value() !== value) this.value.set(value);
  }

  /** Runs after Quartz's own tablist handler (events bubble): adopt or undo a keyboard move. */
  protected onKeydown(event: KeyboardEvent): void {
    if (!(event.target as Element | null)?.closest('[role="tablist"]')) return;
    const current = this.tabs.value();
    if (current === this.settled) return;
    if (this.activateOnFocus()) {
      this.settled = current;
      this.value.set(current ?? undefined);
    } else {
      this.tabs.value.set(this.settled);
    }
  }

  /** A tab (re)registered: if Volt's value is not what Quartz shows, Volt's wins. */
  tabRegistered(): void {
    const value = this.value();
    if (value !== undefined && this.tabs.value() !== value) this.tabs.value.set(value);
  }
}
