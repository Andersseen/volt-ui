import { DestroyRef, inject, Injector, signal } from '@angular/core';
import { NgControl, StatusChangeEvent, TouchedChangeEvent } from '@angular/forms';

export function injectFormControlState() {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  // Forms' touched/invalid flags are not signals. Bumping this on the control's events lets an
  // OnPush control re-render when state changes from outside, e.g. `form.markAllAsTouched()`.
  const version = signal(0);
  let control: NgControl | null | undefined;
  let subscribed = false;

  return {
    invalid(): boolean {
      version();
      // Resolved lazily: the NgControl on this element is created after the value accessor.
      control ??= injector.get(NgControl, null, { optional: true, self: true });

      if (control?.control && !subscribed) {
        subscribed = true;
        const subscription = control.control.events.subscribe(event => {
          if (event instanceof TouchedChangeEvent || event instanceof StatusChangeEvent) {
            version.update(v => v + 1);
          }
        });
        destroyRef.onDestroy(() => subscription.unsubscribe());
      }

      return !!control?.invalid && !!control.touched;
    },
  };
}
