import {
  afterRenderEffect,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';

/**
 * Keeps `aria-invalid` on a native control that ng-primitives also manages.
 *
 * `ngpInput` / `ngpFormControl` write `aria-invalid` from the Angular form control alone and
 * remove it otherwise, which erases a Volt-level invalid state such as `state="error"` that no
 * form control backs. This re-applies the combined value after the primitive's own write.
 *
 */
@Directive({ selector: '[voltAriaInvalid]' })
export class VoltAriaInvalid {
  readonly voltAriaInvalid = input<boolean, unknown>(false, { transform: booleanAttribute });

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterRenderEffect({
      // `read` is the last phase: the primitive writes in `mixedReadWrite`, and phase order, unlike
      // registration order, is guaranteed. This is a write on purpose; nothing is measured here.
      read: () => {
        if (this.voltAriaInvalid()) {
          element.setAttribute('aria-invalid', 'true');
        } else {
          element.removeAttribute('aria-invalid');
        }
      },
    });
  }
}
