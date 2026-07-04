import {
  Component,
  ChangeDetectionStrategy,
  signal,
  effect,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  applyVoltTheme,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  type VoltThemeColor,
  type VoltThemeStyle,
} from 'volt';
import { LmnMoonIcon, LmnSunIcon } from 'lumen-icons';

@Component({
  selector: 'app-theme-switcher',
  imports: [
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSelectLabel,
    LmnSunIcon,
    LmnMoonIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2 sm:gap-3">
      <div class="hidden lg:flex items-center gap-2">
        <div class="w-[130px] xl:w-[140px]">
          <volt-select [(value)]="color" placeholder="Theme Color">
            <volt-select-content>
              <volt-select-label>Palettes</volt-select-label>
              <volt-select-item value="volt">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-indigo-500"></span> Volt
                </div>
              </volt-select-item>
              <volt-select-item value="ember">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-orange-500"></span> Ember
                </div>
              </volt-select-item>
              <volt-select-item value="sage">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-500"></span> Sage
                </div>
              </volt-select-item>
              <volt-select-item value="dusk">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-purple-500"></span> Dusk
                </div>
              </volt-select-item>
              <volt-select-item value="glacier">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-sky-500"></span> Glacier
                </div>
              </volt-select-item>
            </volt-select-content>
          </volt-select>
        </div>
      </div>

      <div class="hidden xl:flex items-center gap-2">
        <div class="w-[120px]">
          <volt-select [(value)]="style" placeholder="Style">
            <volt-select-content>
              <volt-select-label>Styles</volt-select-label>
              <volt-select-item value="sharp">Sharp</volt-select-item>
              <volt-select-item value="soft">Soft</volt-select-item>
              <volt-select-item value="brutal">Brutal</volt-select-item>
              <volt-select-item value="ghost">Ghost</volt-select-item>
              <volt-select-item value="retro">Retro</volt-select-item>
            </volt-select-content>
          </volt-select>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-surface hover:bg-muted text-sm"
        (click)="toggleDark()"
        aria-label="Toggle dark mode"
      >
        @if (isDark()) {
          <lmn-moon [size]="20" />
        } @else {
          <lmn-sun [size]="20" />
        }
      </button>
    </div>
  `,
})
export class ThemeSwitcher {
  color = signal<unknown>('volt');
  style = signal<unknown>('sharp');
  isDark = signal(false);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedColor = localStorage.getItem('volt-color') || 'volt';
      const savedStyle = localStorage.getItem('volt-style') || 'sharp';
      const isDarkMode = localStorage.getItem('volt-dark') === 'true';

      this.color.set(savedColor);
      this.style.set(savedStyle);
      this.isDark.set(isDarkMode);

      applyVoltTheme({
        color: savedColor as VoltThemeColor,
        style: savedStyle as VoltThemeStyle,
        dark: isDarkMode,
      });

      effect(() => {
        const c = this.color() as VoltThemeColor;
        applyVoltTheme({ color: c });
        localStorage.setItem('volt-color', c);
      });

      effect(() => {
        const s = this.style() as VoltThemeStyle;
        applyVoltTheme({ style: s });
        localStorage.setItem('volt-style', s);
      });
    }
  }

  toggleDark() {
    this.isDark.set(!this.isDark());
    applyVoltTheme({ dark: this.isDark() });
    localStorage.setItem('volt-dark', String(this.isDark()));
  }
}
