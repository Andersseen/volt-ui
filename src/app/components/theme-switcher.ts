import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { LmnChevronDownIcon, LmnMoonIcon, LmnSunIcon } from 'lumen-icons';
import {
  applyVoltTheme,
  VoltPopoverContent,
  VoltPopoverTrigger,
  VoltToggleGroup,
  VoltToggleGroupItem,
  type VoltThemeColor,
  type VoltThemeStyle,
} from 'volt';
import { Translations } from '../i18n/translations';

interface ColorOption {
  readonly id: VoltThemeColor;
  readonly label: string;
  /** Fixed brand colour, not a token: this swatch has to show a palette the page is not using. */
  readonly swatch: string;
}

const COLORS: readonly ColorOption[] = [
  { id: 'volt', label: 'Volt', swatch: 'bg-indigo-500' },
  { id: 'ember', label: 'Ember', swatch: 'bg-orange-500' },
  { id: 'sage', label: 'Sage', swatch: 'bg-emerald-500' },
  { id: 'dusk', label: 'Dusk', swatch: 'bg-purple-500' },
  { id: 'glacier', label: 'Glacier', swatch: 'bg-sky-500' },
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
 */
@Component({
  selector: 'app-theme-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltPopoverTrigger,
    VoltPopoverContent,
    VoltToggleGroup,
    VoltToggleGroupItem,
    LmnSunIcon,
    LmnMoonIcon,
    LmnChevronDownIcon,
  ],
  template: `
    <div class="flex items-center gap-2">
      <button
        type="button"
        [voltPopover]="themePanel"
        placement="bottom-end"
        class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-surface px-2.5 text-sm transition-colors hover:bg-muted"
        [attr.aria-label]="triggerLabel()"
      >
        <span class="h-4 w-4 rounded-full ring-1 ring-border" [class]="activeSwatch()"></span>
        <lmn-chevron-down [size]="12" class="text-muted-foreground" />
      </button>

      <button
        type="button"
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-surface text-sm transition-colors hover:bg-muted"
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
                <span class="h-4 w-4 rounded-full ring-1 ring-border" [class]="option.swatch">
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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  protected readonly colors = COLORS;
  protected readonly styles = STYLES;

  readonly color = signal<VoltThemeColor>('volt');
  readonly style = signal<VoltThemeStyle>('sharp');
  readonly isDark = signal(false);

  /** The toggle groups speak in arrays, even the single-selection ones. */
  protected readonly colorValue = computed(() => [this.color()]);
  protected readonly styleValue = computed(() => [this.style()]);

  protected readonly activeSwatch = computed(
    () => COLORS.find(option => option.id === this.color())?.swatch ?? COLORS[0].swatch
  );

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
    if (isPlatformBrowser(this.platformId)) {
      const savedColor = (localStorage.getItem('volt-color') as VoltThemeColor | null) ?? 'volt';
      const savedStyle = (localStorage.getItem('volt-style') as VoltThemeStyle | null) ?? 'sharp';
      const isDarkMode = localStorage.getItem('volt-dark') === 'true';

      this.color.set(savedColor);
      this.style.set(savedStyle);
      this.isDark.set(isDarkMode);

      applyVoltTheme({ color: savedColor, style: savedStyle, dark: isDarkMode });

      effect(() => {
        const color = this.color();
        applyVoltTheme({ color });
        localStorage.setItem('volt-color', color);
      });

      effect(() => {
        const style = this.style();
        applyVoltTheme({ style });
        localStorage.setItem('volt-style', style);
      });
    }
  }

  /** Deselection is off, so an empty array only ever means a re-click on the active item. */
  protected onColorChange(value: string[]): void {
    const [next] = value;

    if (next) {
      this.color.set(next as VoltThemeColor);
    }
  }

  protected onStyleChange(value: string[]): void {
    const [next] = value;

    if (next) {
      this.style.set(next as VoltThemeStyle);
    }
  }

  toggleDark(): void {
    this.isDark.set(!this.isDark());
    applyVoltTheme({ dark: this.isDark() });
    localStorage.setItem('volt-dark', String(this.isDark()));
  }
}
