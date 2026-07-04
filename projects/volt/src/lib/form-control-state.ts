import { inject, Injector } from '@angular/core';
import { NgControl } from '@angular/forms';

export function injectFormControlState() {
  const injector = inject(Injector);
  let control: NgControl | null | undefined;

  return {
    invalid(): boolean {
      control ??= injector.get(NgControl, null, { optional: true, self: true });
      return !!control?.invalid && !!control.touched;
    },
  };
}
