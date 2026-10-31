import { inject, Renderer2 } from '@angular/core';

/**
 * Returns a function that makes `element`'s attributes equal to `attributes` (`null` removes one).
 *
 * Quartz writes some attributes through host bindings (`id`, `role`, `aria-pressed`) that cannot be
 * overridden from a template binding on the same element: the directive's binding runs last. Where
 * Volt's public contract differs from Quartz's, a wrapper calls this from `ngAfterViewChecked`,
 * which runs after those bindings — on the server as well as in the browser, so the prerendered
 * HTML already carries the Volt value. Call from an injection context.
 */
export function injectAttributeWriter(): (
  element: Element,
  attributes: Record<string, string | null>
) => void {
  const renderer = inject(Renderer2);
  return (element, attributes) => {
    for (const [name, value] of Object.entries(attributes)) {
      if (value === null) {
        if (element.hasAttribute(name)) renderer.removeAttribute(element, name);
      } else if (element.getAttribute(name) !== value) {
        renderer.setAttribute(element, name, value);
      }
    }
  };
}
