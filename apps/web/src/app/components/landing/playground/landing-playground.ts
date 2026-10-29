import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LmnSparklesIcon } from 'lumen-icons';
import { VoltButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import {
  COLOR_PRESETS,
  STYLE_PRESETS,
  type ColorPreset,
  type StylePreset,
} from '@shared/lib/theme-presets';
import { LandingSectionHeader } from '@shared/components/section-header';
import { PalettePicker } from './palette-picker';
import { ShapePicker } from './shape-picker';
import { ThemePreview } from './theme-preview';
import { ThemeSnippet } from './theme-snippet';

/** How long the tour lingers on each palette. */
export const TOUR_STEP_MS = 4200;
const TICK_MS = 50;

/**
 * The theme playground: owns the chosen preset pair and the tour, and lays out the pickers,
 * the config snippet and the preview.
 *
 * Until the visitor picks something, a tour walks the palettes (and steps the shape after each
 * full lap). It runs only in the browser, never under `prefers-reduced-motion`, freezes while
 * the section is off screen, and ends the moment the visitor makes a choice.
 */
@Component({
  selector: 'app-landing-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    VoltButton,
    LmnSparklesIcon,
    LandingSectionHeader,
    PalettePicker,
    ShapePicker,
    ThemePreview,
    ThemeSnippet,
  ],
  template: `
    <section class="border-y border-border/60 bg-muted/30">
      <div class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <app-landing-section-header
          [eyebrow]="t('landing.playground.eyebrow')"
          [title]="t('landing.playground.title')"
          [lede]="t('landing.playground.subtitle')"
        />

        <div class="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
          <div class="space-y-8">
            <app-palette-picker
              [selected]="color()"
              [touring]="touring()"
              [progress]="progress()"
              [canTour]="canTour()"
              (picked)="pickColor($event)"
              (toggleTour)="touring.set(!touring())"
            />
            <app-shape-picker [selected]="shape()" (picked)="pickShape($event)" />
            <app-theme-snippet [color]="color()" [shape]="shape()" />
            <volt-button variant="outline" [routerLink]="path('/create-theme')">
              <lmn-sparkles slot="leading" [size]="16" class="text-primary" />
              {{ t('landing.playground.cta') }}
            </volt-button>
          </div>

          <app-theme-preview [color]="color()" [shape]="shape()" [dark]="dark()" />
        </div>
      </div>
    </section>
  `,
})
export class LandingPlayground {
  private readonly translations = injectAppI18n();
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  readonly color = signal<ColorPreset>('ember');
  readonly shape = signal<StylePreset>('soft');
  /** Whether the tour is running. Never true on the server or under reduced motion. */
  readonly touring = signal(false);
  /** False until the browser confirms the tour may run at all. */
  protected readonly canTour = signal(false);
  /** How far the tour is into the current palette, 0–100. */
  protected readonly progress = signal(0);
  private readonly visible = signal(false);
  protected readonly dark = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const root = this.document.documentElement;

      // The site's dark toggle is a class on <html>; follow it so the preview matches the page.
      this.dark.set(root.classList.contains('dark'));
      const classes = new MutationObserver(() => this.dark.set(root.classList.contains('dark')));
      classes.observe(root, { attributes: true, attributeFilter: ['class'] });

      const visibility = new IntersectionObserver(([entry]) =>
        this.visible.set(entry.isIntersecting)
      );
      visibility.observe(this.host.nativeElement);

      // The tour's clock. It only moves while the tour runs and the section is on screen.
      const clock = setInterval(() => {
        if (!this.touring() || !this.visible()) {
          return;
        }
        const next = this.progress() + (TICK_MS / TOUR_STEP_MS) * 100;
        if (next >= 100) {
          this.progress.set(0);
          this.advance();
        } else {
          this.progress.set(next);
        }
      }, TICK_MS);

      destroyRef.onDestroy(() => {
        clearInterval(clock);
        classes.disconnect();
        visibility.disconnect();
      });

      if (!this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.canTour.set(true);
        this.touring.set(true);
      }
    });
  }

  /** Next palette; after the last one, the next shape too. */
  advance(): void {
    const next = (COLOR_PRESETS.indexOf(this.color()) + 1) % COLOR_PRESETS.length;
    this.color.set(COLOR_PRESETS[next]);

    if (next === 0) {
      const shape = (STYLE_PRESETS.indexOf(this.shape()) + 1) % STYLE_PRESETS.length;
      this.shape.set(STYLE_PRESETS[shape]);
    }
  }

  pickColor(name: ColorPreset): void {
    this.touring.set(false);
    this.progress.set(0);
    this.color.set(name);
  }

  pickShape(name: StylePreset): void {
    this.touring.set(false);
    this.progress.set(0);
    this.shape.set(name);
  }
}
