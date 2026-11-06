import {
  computed,
  Directive,
  forwardRef,
  inject,
  InjectionToken,
  input,
  type Signal,
} from '@angular/core';
import type { VoltThemeOptions } from './theme';

/** What a scope contributes, already merged with the scopes around it. */
const VOLT_THEME_SCOPE = new InjectionToken<{ resolved: Signal<VoltThemeOptions> }>(
  'VOLT_THEME_SCOPE'
);

const THEME_HOST = {
  '[attr.data-volt-theme]': "theme() ? '' : null",
  '[attr.data-color]': 'theme()?.color ?? null',
  '[attr.data-style]': 'theme()?.style ?? null',
  '[attr.data-density]': 'theme()?.density ?? null',
  '[attr.data-mode]': "theme()?.dark === false ? 'light' : null",
  '[class.dark]': 'theme()?.dark === true',
  '[style.color-scheme]': "theme()?.dark === undefined ? null : theme()?.dark ? 'dark' : 'light'",
};

/**
 * Applies a palette, style, mode or density to one element and everything inside it, with the same
 * tokens as `provideVoltTheme`. It writes attributes, so it renders on the server like any other
 * binding, and leaves the rest of the page alone.
 *
 * ```html
 * <section [voltTheme]="{ color: 'ember', style: 'soft', dark: true }">…</section>
 * ```
 *
 * Anything omitted is inherited from the surrounding scope or the page. Set `color` and `style`
 * together for a self-contained island: the offset shadows of Brutal and Retro are drawn in the
 * palette of the element that sets the style. Overlays declared inside the scope carry it with them
 * (see `VoltThemeInherit`), and a dialog opened from a service does when given an `injector` from
 * inside the scope. Toasts belong to the page.
 */
@Directive({
  selector: '[voltTheme]',
  providers: [{ provide: VOLT_THEME_SCOPE, useExisting: forwardRef(() => VoltTheme) }],
  host: THEME_HOST,
})
export class VoltTheme {
  private readonly parent = inject(VOLT_THEME_SCOPE, { optional: true, skipSelf: true });

  readonly voltTheme = input<VoltThemeOptions, VoltThemeOptions | ''>(
    {},
    { transform: value => value || {} }
  );

  /** Everything in force here, for overlays that render outside this element. */
  readonly resolved = computed<VoltThemeOptions>(() => {
    const inherited = this.parent?.resolved() ?? {};
    const own = this.voltTheme();
    return {
      color: own.color ?? inherited.color,
      style: own.style ?? inherited.style,
      density: own.density ?? inherited.density,
      dark: own.dark ?? inherited.dark,
    };
  });

  /**
   * What this element itself writes. A scope that forces a mode needs a palette to apply it to, and
   * a nested scope repeats the mode so an outer `.dark` selector cannot reach past it.
   */
  protected readonly theme = computed<VoltThemeOptions>(() => {
    const { color, dark } = this.resolved();
    const own = this.voltTheme();
    return {
      ...own,
      dark,
      color: own.color ?? (dark === undefined ? undefined : (color ?? 'volt')),
    };
  });
}

/**
 * Carries the surrounding `voltTheme` scope onto an element rendered outside it. Overlays are
 * portalled to the document body, where CSS inheritance can no longer reach them, so every Volt
 * overlay surface uses this. Without a scope it writes nothing. Add it to your own portalled content.
 */
@Directive({
  selector: '[voltThemeInherit]',
  host: THEME_HOST,
})
export class VoltThemeInherit {
  private readonly scope = inject(VOLT_THEME_SCOPE, { optional: true });

  protected readonly theme = computed(() => this.scope?.resolved() ?? null);
}
