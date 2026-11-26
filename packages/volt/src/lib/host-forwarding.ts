import {
  afterRenderEffect,
  computed,
  effect,
  ElementRef,
  HostAttributeToken,
  inject,
  Renderer2,
  untracked,
} from '@angular/core';

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

/** The part of a form field's state that lists the ids describing its control. */
export interface DescriptionRegistry {
  addDescription(id: string): void;
  removeDescription(id: string): void;
}

/**
 * Applies a consumer's `aria-describedby` to the native control of a wrapper (`<volt-input
 * aria-describedby="help">`), merged with what the headless engine already writes there.
 *
 * The engine is the only writer of `aria-describedby` on a control inside a form field (hint and
 * error ids), so inside one the consumer's ids join the field's descriptions and the engine writes
 * the combined list. Outside a form field nothing else describes the control, and Volt writes the
 * ids itself after render. The static host copy is removed, as with the other forwarded
 * attributes. Call from a constructor.
 *
 * Limitation: outside a form field the attribute is written in the browser, after render, so a
 * server-rendered page gains it on hydration.
 */
export function forwardDescribedBy(
  ids: () => string | null | undefined,
  control: () => Element | undefined,
  registry: () => DescriptionRegistry | null | undefined
): void {
  forwardAttributesFromHost('aria-describedby');
  const renderer = inject(Renderer2);
  const tokens = computed(() => (ids() ?? '').split(/\s+/).filter(Boolean));

  effect(onCleanup => {
    const field = registry();
    const list = tokens();
    if (!field) return;
    untracked(() => list.forEach(id => field.addDescription(id)));
    onCleanup(() => untracked(() => list.forEach(id => field.removeDescription(id))));
  });

  // ng-primitives writes the control's `aria-describedby` (null outside a form field) in an
  // afterRenderEffect's default `mixedReadWrite` phase. `read` is the phase after it, so this write
  // lands last; it only touches an attribute nothing else in that phase reads.
  afterRenderEffect({
    read: () => {
      if (registry()) return;
      const element = control();
      if (!element) return;
      const value = tokens().join(' ');
      if (value) renderer.setAttribute(element, 'aria-describedby', value);
      else renderer.removeAttribute(element, 'aria-describedby');
    },
  });
}
