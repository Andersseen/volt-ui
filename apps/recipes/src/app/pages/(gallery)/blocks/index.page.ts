import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogBrowser } from '../../../components/catalog-browser/catalog-browser';
import { UPCOMING_BLOCKS } from '../../../lib/blocks-metadata';
import { VoltBadge, VoltCard } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';

@Component({
  selector: 'app-blocks-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CatalogBrowser, VoltBadge, VoltCard],
  template: `
    <app-catalog-browser
      kind="blocks"
      titleKey="gallery.blocks.title"
      ledeKey="gallery.blocks.lede"
    >
      <div class="grid gap-3 border-t border-border pt-10 sm:grid-cols-3">
        <volt-card class="p-4 shadow-none">
          <p class="text-sm font-medium">{{ t('gallery.blocks.oneFile') }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('gallery.blocks.oneFileBody') }}</p>
        </volt-card>
        <volt-card class="p-4 shadow-none">
          <p class="text-sm font-medium">{{ t('gallery.blocks.noRuntime') }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('gallery.blocks.noRuntimeBody') }}</p>
        </volt-card>
        <volt-card class="p-4 shadow-none">
          <p class="text-sm font-medium">{{ t('gallery.blocks.themeAware') }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('gallery.blocks.themeAwareBody') }}</p>
        </volt-card>
      </div>

      <section class="space-y-4">
        <div class="flex items-baseline gap-3">
          <h2 class="text-lg font-semibold">{{ t('gallery.comingSoon') }}</h2>
          <span class="text-sm text-muted-foreground">
            {{ t('gallery.comingSoonHint') }}
          </span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          @for (block of upcoming; track block.labelKey) {
            <volt-card class="border-dashed bg-muted/10 p-4 text-muted-foreground shadow-none">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-medium text-foreground/70">{{ t(block.labelKey) }}</p>
                <volt-badge variant="secondary" class="shrink-0">{{
                  t('gallery.soon')
                }}</volt-badge>
              </div>
              <p class="mt-1.5 text-sm">{{ t(block.taglineKey) }}</p>
            </volt-card>
          }
        </div>
        <p class="text-sm text-muted-foreground">
          {{ t('gallery.missing') }}
          <a
            href="https://github.com/andersseen/volt-ui/issues/new"
            target="_blank"
            rel="noreferrer"
            class="text-primary underline-offset-4 hover:underline"
          >
            {{ t('gallery.openIssue') }}
          </a>
          {{ t('gallery.missingTail') }}
        </p>
      </section>
    </app-catalog-browser>
  `,
})
export default class BlocksIndexPage {
  protected readonly t = injectAppI18n().t;
  protected readonly upcoming = UPCOMING_BLOCKS;
}
