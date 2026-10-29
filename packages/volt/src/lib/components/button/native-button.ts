import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import { ngpFocusVisible, ngpInteractions } from 'ng-primitives/interactions';
import { forwardAttributesFromHost } from '../../host-forwarding';
import { cn } from '../../utils';
import { buttonVariants, type ButtonVariants } from './variants';

/**
 * Button styles on a native `<button>` or `<a>`, so the element you write is the element that is
 * focused, named and announced:
 *
 * ```html
 * <button voltButton type="submit">Save</button>
 * <a voltButton variant="outline" routerLink="/docs">Docs</a>
 * <button voltButton size="icon" aria-label="Close"><svg aria-hidden="true">…</svg></button>
 * ```
 *
 * Native semantics are untouched: no role is added, `type` is yours to set (a `<button>` inside a
 * `<form>` submits unless you write `type="button"`), and every attribute — `aria-*`, `id`,
 * `routerLink`, `href`, `target` — stays on the element.
 *
 * `disabled` only applies to `<button>`. HTML has no disabled link, and faking one with
 * `pointer-events` leaves it reachable by keyboard; render a disabled `<button voltButton>` or drop
 * the link instead.
 *
 * To keep a blocked action focusable so `aria-describedby` can explain why, use
 * `aria-disabled="true"` instead of `disabled`. Volt only dims it; it does **not** stop clicks or
 * Enter/Space, so guard the handler yourself (`if (blocked()) return;`).
 */
@Directive({
  selector: 'button[voltButton], a[voltButton]',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.disabled]': 'nativeDisabled() ? "" : null',
    '[attr.data-disabled]': 'nativeDisabled() ? "" : null',
  },
})
export class VoltNativeButton {
  private readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName.toLowerCase() === 'button';

  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');
  /** Disables a `<button>`. Ignored on `<a>`, see above. */
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly class = input<string>('');

  protected readonly nativeDisabled = computed(() => this.isButton && this.disabled());

  protected readonly classes = computed(() =>
    cn(buttonVariants({ variant: this.variant(), size: this.size() }), this.class())
  );

  constructor() {
    // Hover/press/focus-visible data attributes. `NgpButton` is deliberately not used here:
    // since ng-primitives 0.12x it owns `aria-disabled` and clears it whenever the button is not
    // "soft" disabled, which would erase an `aria-disabled` the consumer writes on the element.
    // That attribute is the consumer's (see above), so only the interaction state is borrowed.
    ngpInteractions({ hover: true, press: true, disabled: this.nativeDisabled });
    ngpFocusVisible({ disabled: this.nativeDisabled });

    if (!this.isButton) {
      // A static `disabled` on <a> means nothing to the browser or assistive tech; drop it so
      // stylesheets keyed on [disabled] do not make the link look disabled while it still works.
      forwardAttributesFromHost('disabled');
    }

    if (isDevMode() && !this.isButton) {
      effect(() => {
        if (this.disabled()) {
          console.warn(
            '[voltButton] `disabled` has no effect on <a>. Use <button voltButton disabled> instead.'
          );
        }
      });
    }
  }
}
