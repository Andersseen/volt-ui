import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, effect, inject, input } from '@angular/core';

const ATTRIBUTE = 'data-theme-studio-preview';

/**
 * Puts the studio's generated stylesheet in `<head>`, so the preview is painted by the very CSS the
 * studio exports (under a private palette name) rather than by inline variables that only resemble
 * it. Portalled overlays opened from the preview match the same selectors through `voltThemeInherit`.
 *
 * It uses the injected `DOCUMENT`, so it renders on the server too; the browser reuses the server's
 * element instead of adding a second one, and removes it when the studio is left. The CSS is text
 * the studio generated from validated `#rrggbb` values and numbers, never user-supplied CSS.
 */
@Directive({ selector: '[appThemeStudioStylesheet]' })
export class ThemeStudioStylesheet {
  readonly appThemeStudioStylesheet = input.required<string>();

  constructor() {
    const document = inject(DOCUMENT);
    let element = document.head.querySelector<HTMLStyleElement>(`style[${ATTRIBUTE}]`);
    if (!element) {
      element = document.createElement('style');
      element.setAttribute(ATTRIBUTE, '');
      document.head.appendChild(element);
    }
    const style = element;

    effect(() => {
      style.textContent = this.appThemeStudioStylesheet();
    });
    inject(DestroyRef).onDestroy(() => style.remove());
  }
}
