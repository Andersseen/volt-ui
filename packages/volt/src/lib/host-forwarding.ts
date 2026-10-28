import { ElementRef, HostAttributeToken, inject, Renderer2 } from '@angular/core';

/*
 * For wrapper components that render one native element (`<input>`, `<label>`, `<button>`…)
 * and apply some of their inputs to it.
 *
 * Angular writes a static `class="…"` or `aria-label="…"` to the host element *and* hands the
 * value to the matching input. Left alone, a consumer's `class="px-2"` pads both the wrapper and
 * the control, a duplicated `id` makes `<label for>` resolve to the host, and an `aria-label`
 * sits on a host that has no role. These helpers remove the static host copy so the value exists
 * once, on the element that owns it.
 *
 * Call them from a constructor or field initializer. They use `Renderer2`, so they are SSR-safe.
 * Bindings a consumer writes as `[attr.x]` or `[class.x]` are applied later and are not touched.
 */

/**
 * Removes the consumer's static class tokens from the host, for components that apply their
 * `class` input to an inner element. `ownClasses` (the component's own host classes) are kept.
 */
export function forwardClassFromHost(ownClasses = ''): void {
  const staticClass = inject(new HostAttributeToken('class'), { optional: true });
  if (!staticClass) return;

  const host = inject<ElementRef<Element>>(ElementRef).nativeElement;
  const renderer = inject(Renderer2);
  const own = new Set(ownClasses.split(/\s+/));

  for (const token of staticClass.split(/\s+/)) {
    if (token && !own.has(token)) {
      renderer.removeClass(host, token);
    }
  }
}

/** Removes static attributes from the host whose value the component forwards to its native element. */
export function forwardAttributesFromHost(...names: string[]): void {
  const host = inject<ElementRef<Element>>(ElementRef).nativeElement;
  const renderer = inject(Renderer2);

  for (const name of names) {
    renderer.removeAttribute(host, name);
  }
}
