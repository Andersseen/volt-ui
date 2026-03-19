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

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem, VoltSelectLabel],
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        } @else {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        }
      </button>
    </div>
  `,
})
export class ThemeSwitcher {
  color = signal('volt');
  style = signal('sharp');
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
        const c = this.color();
        document.documentElement.setAttribute('data-color', c);
        localStorage.setItem('volt-color', c);
      });

      effect(() => {
        const s = this.style();
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
