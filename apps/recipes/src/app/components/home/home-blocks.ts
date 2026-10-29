import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnArrowRightIcon, LmnFileIcon, LmnSparklesIcon, LmnZapIcon } from 'lumen-icons';
import { VoltNativeButton } from 'volt';
import { LandingSectionHeader } from '@shared/components/section-header';
import { Reveal } from '@shared/components/reveal';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { MOTION } from '@shared/lib/motion';
import { entriesOf } from '../../lib/catalog';
import { CatalogCard } from '../catalog-card';

interface BlockPromise {
  readonly icon: 'file' | 'zap' | 'sparkles';
  readonly titleKey: PlainTranslationKey;
  readonly bodyKey: PlainTranslationKey;
}

const PROMISES: readonly BlockPromise[] = [
  { icon: 'file', titleKey: 'gallery.blocks.oneFile', bodyKey: 'gallery.blocks.oneFileBody' },
  { icon: 'zap', titleKey: 'gallery.blocks.noRuntime', bodyKey: 'gallery.blocks.noRuntimeBody' },
  {
    icon: 'sparkles',
    titleKey: 'gallery.blocks.themeAware',
    bodyKey: 'gallery.blocks.themeAwareBody',
  },
];

/** Blocks: what every one of them promises, then four of them, large enough to read. */
@Component({
  selector: 'app-home-blocks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LmnArrowRightIcon,
    LmnFileIcon,
    LmnSparklesIcon,
    LmnZapIcon,
    VoltNativeButton,
    LandingSectionHeader,
    Reveal,
    CatalogCard,
  ],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <app-landing-section-header
        [eyebrow]="t('gallery.blocks.title')"
        [title]="t('recipes.home.blocksTitle')"
        [lede]="t('gallery.blocks.lede')"
      />

      <ul class="mt-12 grid gap-8 sm:grid-cols-3">
        @for (promise of promises; track promise.titleKey; let i = $index) {
          <li [appReveal]="i * stagger" class="flex gap-4">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              @switch (promise.icon) {
                @case ('file') {
                  <lmn-file [size]="20" />
                }
                @case ('zap') {
                  <lmn-zap [size]="20" />
                }
                @case ('sparkles') {
                  <lmn-sparkles [size]="20" />
                }
              }
            </span>
            <div>
              <h3 class="font-semibold">{{ t(promise.titleKey) }}</h3>
              <p class="mt-1 text-sm leading-6 text-muted-foreground">{{ t(promise.bodyKey) }}</p>
            </div>
          </li>
        }
      </ul>

      <div class="mt-14 grid gap-6 md:grid-cols-2">
        @for (entry of featured; track entry.id; let i = $index) {
          <app-catalog-card [appReveal]="i * stagger" [entry]="entry" />
        }
      </div>

      <a voltButton variant="outline" size="lg" class="group mt-10" [routerLink]="path('/blocks')">
        {{ t('gallery.blocks.browse') }}
        <lmn-arrow-right
          [size]="16"
          class="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </a>
    </section>
  `,
})
export class HomeBlocks {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected readonly promises = PROMISES;
  protected readonly featured = entriesOf('blocks').slice(0, 4);
  protected readonly stagger = MOTION.stagger;
}
