import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { LmnChevronDownIcon, LmnMoonIcon, LmnSunIcon } from 'lumen-icons';
import {
  applyVoltTheme,
  VoltNativeButton,
  VoltPopoverContent,
  VoltPopoverTrigger,
  VoltTheme,
  VoltToggleGroup,
  VoltToggleGroupItem,
  type VoltThemeColor,
  type VoltThemeDensity,
  type VoltThemeStyle,
} from 'volt';
import { injectAppI18n } from '../i18n/i18n';
import {
  DEFAULT_THEME_PREFS,
  isColor,
  isStyle,
  loadThemePrefs,
  safeLocalStorage,
  saveThemePrefs,
  themePrefsEqual,
  type ThemePrefs,
} from '../lib/theme-preferences';

const COLORS: readonly { id: VoltThemeColor; label: string }[] = [
  { id: 'volt', label: 'Volt' },
  { id: 'ember', label: 'Ember' },
  { id: 'sage', label: 'Sage' },
  { id: 'dusk', label: 'Dusk' },
  { id: 'glacier', label: 'Glacier' },
];

const STYLES: readonly { id: VoltThemeStyle; label: string }[] = [
  { id: 'sharp', label: 'Sharp' },
  { id: 'soft', label: 'Soft' },
  { id: 'brutal', label: 'Brutal' },
  { id: 'ghost', label: 'Ghost' },
  { id: 'retro', label: 'Retro' },
];

/**
 * Palette and shape pickers, behind one button.
 *
 * These used to be two inline selects, roughly 280px of a header that also carries a
 * logo, five links, a version badge and two icon buttons — enough that the nav wrapped
 * onto a second line on a 14" laptop. A popover costs one extra click for something a
 * visitor changes a handful of times, and gives the picker room to show the palettes as
 * colours instead of as a list of words.
 *
 * Toggle groups rather than selects, now that there is space: a select would open a
 * second overlay inside this one, and the outside-click handling of two stacked portals
 * is not a fight worth having for five options.
 *
 * Each swatch is a one-element `voltTheme` scope painted `bg-primary`: the primary of that palette
 * in the page's current mode, read from the real tokens, so a swatch can never show another colour.
 */
@Component({
  selector: 'app-theme-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltNativeButton,
    VoltPopoverTrigger,
    VoltPopoverContent,
    VoltTheme,
    VoltToggleGroup,
    VoltToggleGroupItem,
    LmnSunIcon,
    LmnMoonIcon,
    LmnChevronDownIcon,
  ],
  template: `
    <div class="flex items-center gap-2">
      <button
        voltButton
        variant="outline"
        type="button"
        [voltPopover]="themePanel"
        placement="bottom-end"
        class="h-9 shrink-0 gap-1.5 px-2.5"
        [attr.aria-label]="triggerLabel()"
      >
        <span
          class="h-4 w-4 rounded-full bg-primary ring-1 ring-border"
          [voltTheme]="{ color: color() }"
        ></span>
        <lmn-chevron-down [size]="12" class="text-muted-foreground" />
      </button>

      <button
        voltButton
        variant="outline"
        size="icon"
        type="button"
        class="shrink-0"
        (click)="toggleDark()"
        [attr.aria-label]="t('nav.toggleDark')"
      >
        @if (isDark()) {
          <lmn-moon [size]="20" />
        } @else {
          <lmn-sun [size]="20" />
        }
      </button>
    </div>

    <ng-template #themePanel>
      <!-- volt-popover-content fixes its width with a host class, and it has no class
           input to merge an override through, so the wider panel has to come from an
           inline style. 288px is 30px short of the five shape chips. -->
      <volt-popover-content class="space-y-4" [style.width.px]="340">
        <div>
          <p
            id="theme-palette-label"
            class="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {{ t('nav.palette') }}
          </p>
          <volt-toggle-group
            class="w-full justify-between"
            type="single"
            [allowDeselection]="false"
            [value]="colorValue()"
            (valueChange)="onColorChange($event)"
            aria-labelledby="theme-palette-label"
          >
            @for (option of colors; track option.id) {
              <volt-toggle-group-item [value]="option.id" size="sm">
                <span
                  class="h-4 w-4 rounded-full bg-primary ring-1 ring-border"
                  [voltTheme]="{ color: option.id }"
                >
                </span>
                <!-- The swatch is the whole control, so the name has to come from here. -->
                <span class="sr-only">{{ option.label }}</span>
              </volt-toggle-group-item>
            }
          </volt-toggle-group>
        </div>

        <div>
          <p
            id="theme-shape-label"
            class="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {{ t('nav.shape') }}
          </p>
          <!-- flex-wrap is the safety net: the chips fit at this width with the shipped
               font, and drop to a second row rather than out of the panel if they ever
               stop fitting. -->
          <volt-toggle-group
            class="w-full flex-wrap justify-between gap-1"
            type="single"
            [allowDeselection]="false"
            [value]="styleValue()"
            (valueChange)="onStyleChange($event)"
            aria-labelledby="theme-shape-label"
          >
            @for (option of styles; track option.id) {
              <volt-toggle-group-item [value]="option.id" size="sm">
                {{ option.label }}
              </volt-toggle-group-item>
            }
          </volt-toggle-group>
        </div>
      </volt-popover-content>
    </ng-template>
  `,
})
export class ThemeSwitcher {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  protected readonly colors = COLORS;
  protected readonly styles = STYLES;

  /**
   * The single source of truth. It is written only by `load()` (the stored preference) and
   * `update()` (a choice the visitor made); there are no effects, so a change cannot echo back
   * into storage and a stored default never overwrites a shared preference.
   */
  private readonly prefs = signal<ThemePrefs>(DEFAULT_THEME_PREFS);

  readonly color = computed(() => this.prefs().color);
  readonly style = computed(() => this.prefs().style);
  readonly isDark = computed(() => this.prefs().dark);
  readonly density = computed(() => this.prefs().density);

  /** The toggle groups speak in arrays, even the single-selection ones. */
  protected readonly colorValue = computed(() => [this.color()]);
  protected readonly styleValue = computed(() => [this.style()]);

  /*
   * The palette and shape names are product names — "Volt", "Brutal" — so they stay as
   * they are in every language; only the sentence around them is translated.
   */
  protected readonly triggerLabel = computed(() => {
    const color = COLORS.find(option => option.id === this.color())?.label ?? '';
    const style = STYLES.find(option => option.id === this.style())?.label ?? '';

    return this.t('nav.themeLabel', { color, style });
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.load();

    // A tab that was open while the visitor changed the theme on the sibling site catches up when it
    // comes back to the foreground. Events, not polling; each handler only re-reads the cookie.
    const refresh = () => this.load();
    const onVisible = () => {
      if (this.document.visibilityState === 'visible') refresh();
    };
    const view = this.document.defaultView;
    view?.addEventListener('pageshow', refresh);
    view?.addEventListener('focus', refresh);
    this.document.addEventListener('visibilitychange', onVisible);
    this.destroyRef.onDestroy(() => {
      view?.removeEventListener('pageshow', refresh);
      view?.removeEventListener('focus', refresh);
      this.document.removeEventListener('visibilitychange', onVisible);
    });
  }

  /** Reads the stored preference and applies it if it differs from what is on screen. */
  private load(): void {
    const { prefs } = loadThemePrefs(this.document, safeLocalStorage());
    if (themePrefsEqual(prefs, this.prefs()) && this.applied) return;
    this.applied = true;
    this.prefs.set(prefs);
    applyVoltTheme(prefs, this.document);
  }

  private applied = false;

  /** A choice the visitor made: state, DOM, shared cookie, local fallback — once each. */
  private update(change: Partial<ThemePrefs>): void {
    const next = { ...this.prefs(), ...change };
    this.prefs.set(next);
    applyVoltTheme(next, this.document);
    saveThemePrefs(this.document, safeLocalStorage(), next);
  }

  /** Deselection is off, so an empty array only ever means a re-click on the active item. */
  protected onColorChange(value: string[]): void {
    const [next] = value;

    if (isColor(next)) {
      this.update({ color: next });
    }
  }

  protected onStyleChange(value: string[]): void {
    const [next] = value;

    if (isStyle(next)) {
      this.update({ style: next });
    }
  }

  /** Not yet in the popover: its label needs a Glossa message (see the Patterns PR notes). */
  setDensity(density: VoltThemeDensity): void {
    this.update({ density });
  }

  toggleDark(): void {
    this.update({ dark: !this.isDark() });
  }
}
