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
import { AccordionDirective } from '@quartz-headless/primitives';
import { cn } from '../../utils';

/** Volt's accordion `type`. */
export type VoltAccordionType = 'single' | 'multiple';

/**
 * Quartz opens the first item by itself in a single, non-collapsible accordion whose value is
 * `null`. Volt (like ng-primitives) opens nothing until asked. A value no item has keeps Quartz
 * from doing it, and renders as "nothing open".
 */
const NONE = '\u0000volt-none';

/*
 * Quartz Headless backend for `volt-accordion`; same public contract as the ng-primitives one.
 *
 * Volt owns `value` (`string | string[] | null`; a static value is the initial state, `[(value)]`
 * keeps it in sync). It is written into Quartz silently, and Quartz's value reaches the model
 * only after a user toggle (`userToggled`), so Quartz's own bookkeeping — opening the first item,
 * dropping the value of a removed item — never shows up as a change the consumer did not make.
 * A removed item that returns is open again (`itemRegistered`), as with ng-primitives.
 */
@Component({
  selector: 'volt-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [
    {
      directive: AccordionDirective,
      inputs: ['type', 'collapsible', 'orientation', 'disabled'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltAccordion {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('w-full block', this.class()));

  private readonly accordion = inject(AccordionDirective, { self: true });

  readonly type = input<VoltAccordionType>('single');
  readonly collapsible = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly value = model<string | string[] | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');

  constructor() {
    effect(() => {
      const next = this.toQuartz(this.value(), this.type());
      untracked(() => this.write(next));
    });
  }

  /** A trigger was clicked or activated from the keyboard; runs after Quartz's own toggle. */
  userToggled(): void {
    const next = this.fromQuartz(this.accordion.value());
    if (!this.same(next, this.value())) this.value.set(next);
  }

  /** An item (re)registered: if Quartz does not show Volt's value, Volt's wins. */
  itemRegistered(): void {
    this.write(this.toQuartz(this.value(), this.type()));
  }

  private write(next: string | string[]): void {
    if (!this.same(this.fromQuartz(this.accordion.value()), this.fromQuartz(next))) {
      this.accordion.value.set(next);
    }
  }

  private toQuartz(value: string | string[] | null, type: VoltAccordionType): string | string[] {
    if (type === 'multiple') {
      return Array.isArray(value) ? [...value] : value === null ? [] : [value];
    }
    if (Array.isArray(value)) return value[0] ?? NONE;
    return value ?? NONE;
  }

  private fromQuartz(value: string | string[] | null): string | string[] | null {
    if (Array.isArray(value)) return [...value];
    return value === NONE ? null : value;
  }

  private same(a: string | string[] | null, b: string | string[] | null): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    return a === b;
  }
}
