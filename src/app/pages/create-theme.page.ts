import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltBadge } from 'volt';
import { VoltThreads } from '../components/effects/volt-threads';
import { ThemeStudioOutput } from '../components/theme-studio/theme-studio-output';
import { ThemeStudioPreview } from '../components/theme-studio/theme-studio-preview';
import { ThemeStudioSetup } from '../components/theme-studio/theme-studio-setup';
import { ThemeStudioShape } from '../components/theme-studio/theme-studio-shape';
import { ThemeStudioTokens } from '../components/theme-studio/theme-studio-tokens';
import { ThemeStudioStore } from '../services/theme-studio-store';
import { injectAppI18n } from '../i18n/i18n';

/**
 * The theme studio is a two-column layout over one shared draft. The draft lives in
 * `ThemeStudioStore`, provided here so its lifetime matches the page, and each panel
 * injects it directly rather than being fed through this component.
 */
@Component({
  selector: 'app-create-theme-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ThemeStudioStore],
  imports: [
    VoltBadge,
    VoltThreads,
    ThemeStudioOutput,
    ThemeStudioPreview,
    ThemeStudioSetup,
    ThemeStudioShape,
    ThemeStudioTokens,
  ],
  template: `
    <!-- overflow-x-clip, not overflow-hidden: it still contains the decorative blurs
         but does not create a scroll container, which would silently disable the
         preview panel's position: sticky. -->
    <div class="relative z-10 overflow-x-clip pb-24">
      <section class="relative isolate overflow-hidden border-b border-border/50">
        <div class="theme-grid pointer-events-none absolute inset-0 -z-10"></div>
        <app-volt-threads
          class="studio-threads -z-10"
          [count]="6"
          [intensity]="0.85"
          [pinchX]="0.78"
          [pinchY]="0.5"
          [color]="store.theme().light.primary"
        />
        <div class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div class="max-w-3xl">
            <div class="reveal-up flex flex-wrap items-center gap-2">
              <volt-badge
                variant="outline"
                class="rounded-full border-primary/25 bg-background/60 text-primary backdrop-blur"
                >{{ t('themeStudio.page.eyebrow') }}</volt-badge
              >
              <span class="text-sm text-muted-foreground">{{ t('themeStudio.page.badge') }}</span>
            </div>
            <h1
              class="studio-title landing-display reveal-up reveal-delay-1 mt-6 text-5xl font-bold sm:text-7xl"
            >
              {{ t('themeStudio.page.title') }}
            </h1>
            <p
              class="reveal-up reveal-delay-2 mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
            >
              {{ t('themeStudio.page.lede') }}
            </p>
          </div>
        </div>
      </section>

      <section
        class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:py-14"
      >
        <!-- min-w-0: the generated-CSS <pre> is wider than a phone, and without this
             the grid item refuses to shrink below it and overflows the page. -->
        <div class="min-w-0 space-y-6">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                {{ t('themeStudio.page.editor') }}
              </p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight">
                {{ t('themeStudio.page.foundations') }}
              </h2>
            </div>
            <span class="hidden text-xs text-muted-foreground sm:block">{{
              t('themeStudio.page.instant')
            }}</span>
          </div>

          <app-theme-studio-setup />
          <app-theme-studio-tokens />
          <app-theme-studio-shape />
          <app-theme-studio-output />
        </div>

        <app-theme-studio-preview />
      </section>
    </div>
  `,
  styles: `
    /* Same title treatment as the landing hero: full ink fading toward the brand color. */
    .studio-title {
      background: linear-gradient(
        to bottom,
        var(--foreground) 35%,
        color-mix(in oklch, var(--foreground) 55%, var(--primary))
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    /* The charge sits to the right of the title; the threads fade before they reach the text. */
    .studio-threads {
      mask-image: radial-gradient(ellipse 55% 80% at 78% 50%, black 25%, transparent 75%);
    }

    .theme-grid {
      background-image:
        linear-gradient(
          to right,
          color-mix(in oklch, var(--border) 55%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklch, var(--border) 55%, transparent) 1px,
          transparent 1px
        );
      background-size: 48px 48px;
      mask-image: linear-gradient(to right, black, transparent 85%);
    }
  `,
})
export default class CreateThemePage {
  private readonly translations = injectAppI18n();
  /** The draft being edited; the header's threads are drawn in its primary color. */
  protected readonly store = inject(ThemeStudioStore);

  protected readonly t = this.translations.t;
}
