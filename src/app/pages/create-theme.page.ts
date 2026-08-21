import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltBadge } from 'volt';
import { ThemeStudioOutput } from '../components/theme-studio/theme-studio-output';
import { ThemeStudioPreview } from '../components/theme-studio/theme-studio-preview';
import { ThemeStudioSetup } from '../components/theme-studio/theme-studio-setup';
import { ThemeStudioShape } from '../components/theme-studio/theme-studio-shape';
import { ThemeStudioTokens } from '../components/theme-studio/theme-studio-tokens';
import { ThemeStudioStore } from '../services/theme-studio-store';
import { Translations } from '../i18n/translations';

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
    <main class="relative z-10 overflow-x-clip pb-24">
      <section class="relative border-b border-border/50">
        <div class="theme-grid pointer-events-none absolute inset-0 -z-10"></div>
        <div
          class="pointer-events-none absolute -top-24 left-1/3 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-[100px]"
        ></div>
        <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div class="max-w-3xl">
            <div class="flex flex-wrap items-center gap-2">
              <volt-badge
                variant="outline"
                class="rounded-full border-primary/25 bg-background/75 text-primary backdrop-blur"
                >{{ t('themeStudio.page.eyebrow') }}</volt-badge
              >
              <span class="text-sm text-muted-foreground">{{ t('themeStudio.page.badge') }}</span>
            </div>
            <h1 class="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              {{ t('themeStudio.page.title') }}
            </h1>
            <p class="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
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
    </main>
  `,
  styles: `
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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
}
