import { effect, untracked, type Signal } from '@angular/core';
import type { Observable } from 'rxjs';

/** The slice of an ng-primitives value state that Volt drives. */
export interface PrimitiveValueState<T> {
  setValue(value: T, options?: { emit?: boolean }): void;
  readonly valueChange: Observable<T>;
}

/**
 * Keeps a Volt component's `value` and its primitive's state in step, without ever binding the
 * primitive's own `value` input.
 *
 * Since ng-primitives 0.12x a primitive becomes *controlled* the first time its value input is
 * defined, and stays controlled: a static `value="a"` then freezes the component, because a
 * click only emits and waits for a parent that is not listening. Volt owns `value` instead and
 * writes it into the primitive without emitting, so a static initial value, `[(value)]` and
 * forms all keep working.
 *
 * Call from an injection context (a constructor). `changed` receives only user-driven changes.
 */
export function mirrorValue<T>(
  value: Signal<T>,
  state: () => PrimitiveValueState<T>,
  changed: (value: T) => void
): void {
  effect(() => {
    const next = value();
    untracked(() => state().setValue(next, { emit: false }));
  });
  state().valueChange.subscribe(changed);
}
