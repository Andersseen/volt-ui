import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, effect, inject, input } from '@angular/core';

const ATTRIBUTE = 'data-theme-studio-preview';

/**
 * Puts the studio's generated stylesheet in `<head>`, so the preview is painted by the very CSS the
 * studio exports (under a private palette name) rather than by inline variables that only resemble
 * it. Portalled overlays opened from the preview match the same selectors through `voltThemeInherit`.
 *
 * It is kept the **last** stylesheet in `<head>`, as the export must be in an app (imported after
 * `@voltui/components/themes.css`): the palette's shape overrides and a style preset use selectors of
 * equal specificity, so source order decides, and a site stylesheet injected later would otherwise
 * win. It uses the injected `DOCUMENT`, so it renders on the server too; the browser reuses the server's
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
      // Moves it behind anything added since (the dev server injects styles after hydration).
      if (style !== document.head.lastElementChild) document.head.appendChild(style);
    });
    afterNextRender(() => document.head.appendChild(style));
    inject(DestroyRef).onDestroy(() => style.remove());
  }
}
