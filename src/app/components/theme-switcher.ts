import {
  Component,
  ChangeDetectionStrategy,
  signal,
  effect,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VoltSelect, VoltSelectContent, VoltSelectItem, VoltSelectLabel } from 'volt';
import { IconSun, IconMoon } from '../icons';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem, VoltSelectLabel, IconSun, IconMoon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2 sm:gap-3">
      <div class="hidden lg:flex items-center gap-2">
        <div class="w-[130px] xl:w-[140px]">
          <volt-select
            [value]="color()"
            (valueChange)="color.set($event)"
            placeholder="Theme Color"
          >
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
          <volt-select [value]="style()" (valueChange)="style.set($event)" placeholder="Style">
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
          <icon-moon />
        } @else {
          <icon-sun />
        }
      </button>
    </div>
  `,
})
export class ThemeSwitcher {
  color = signal<unknown>('volt');
  style = signal<unknown>('sharp');
  isDark = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    if (isPlatformBrowser(platformId)) {
      const savedColor = localStorage.getItem('volt-color') || 'volt';
      const savedStyle = localStorage.getItem('volt-style') || 'sharp';
      const isDarkMode = localStorage.getItem('volt-dark') === 'true';

      this.color.set(savedColor);
      this.style.set(savedStyle);
      this.isDark.set(isDarkMode);

      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }

      effect(() => {
        const c = this.color() as string;
        document.documentElement.setAttribute('data-color', c);
        localStorage.setItem('volt-color', c);
      });

      effect(() => {
        const s = this.style() as string;
        document.documentElement.setAttribute('data-style', s);
        localStorage.setItem('volt-style', s);
      });
    }
  }

  toggleDark() {
    this.isDark.set(!this.isDark());
    if (this.isDark()) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('volt-dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('volt-dark', 'false');
    }
  }
}
