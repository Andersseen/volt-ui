import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogBrowser } from '../../../components/catalog-browser/catalog-browser';
import { UPCOMING_BLOCKS } from '../../../lib/blocks-metadata';
import { injectAppI18n } from '@shared/i18n/i18n';

@Component({
  selector: 'app-blocks-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CatalogBrowser],
  template: `
    <app-catalog-browser
      kind="blocks"
      titleKey="gallery.blocks.title"
      ledeKey="gallery.blocks.lede"
    >
      <div class="grid gap-3 border-t border-border pt-10 sm:grid-cols-3">
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <p class="text-sm font-medium">{{ t('gallery.blocks.oneFile') }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('gallery.blocks.oneFileBody') }}</p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <p class="text-sm font-medium">{{ t('gallery.blocks.noRuntime') }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('gallery.blocks.noRuntimeBody') }}</p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <p class="text-sm font-medium">{{ t('gallery.blocks.themeAware') }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('gallery.blocks.themeAwareBody') }}</p>
        </div>
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
            <div
              class="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-muted-foreground"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-medium text-foreground/70">{{ t(block.labelKey) }}</p>
                <span
                  class="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-none"
                >
                  {{ t('gallery.soon') }}
                </span>
              </div>
              <p class="mt-1.5 text-sm">{{ t(block.taglineKey) }}</p>
            </div>
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
