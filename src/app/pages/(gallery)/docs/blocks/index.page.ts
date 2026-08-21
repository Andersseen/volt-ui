import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlockThumbnail } from '../../../../components/block-thumbnail';
import { Reveal } from '../../../../components/reveal';
import { BLOCK_CATEGORIES, BLOCKS, UPCOMING_BLOCKS } from '../../../../lib/blocks-metadata';
import { Translations } from '../../../../i18n/translations';
import { MOTION } from '../../../../lib/motion';

@Component({
  selector: 'app-blocks-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BlockThumbnail, Reveal],
  template: `
    <div class="space-y-10">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('gallery.blocks.title') }}</h1>
        <p class="mt-2 text-lg text-muted-foreground">{{ t('gallery.blocks.lede') }}</p>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
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

      <div class="h-px w-full bg-border"></div>

      @for (category of categories; track category.id) {
        <section class="space-y-5">
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 class="text-lg font-semibold tracking-tight">{{ t(category.labelKey) }}</h2>
            <p class="text-sm text-muted-foreground">{{ t(category.blurbKey) }}</p>
          </div>

          <div class="grid gap-5 lg:grid-cols-2">
            @for (block of category.blocks; track block.slug; let i = $index) {
              <!--
                The card is a <div> with a stretched link, not one big <a>. Blocks contain
                real anchors — a service row, a footer sitemap — and an <a> inside an <a>
                is invalid HTML that the parser silently rewrites, which desynchronises the
                DOM from what the server serialised and breaks hydration. Stretching the
                title's link over the card keeps the whole card clickable, gives the link a
                short accessible name, and never nests.
              -->
              <div
                [appReveal]="(i % 2) * stagger"
                class="group relative flex flex-col overflow-hidden rounded-xl border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 motion-safe:hover:-translate-y-1"
              >
                <div
                  class="thumb relative h-48 overflow-hidden border-b border-border bg-background"
                >
                  <app-block-thumbnail [slug]="block.slug" />
                </div>
                <div class="p-4">
                  <div class="flex items-center justify-between gap-2">
                    <h3 class="font-medium group-hover:text-primary">
                      <a [routerLink]="block.path" class="stretched">{{ t(block.labelKey) }}</a>
                    </h3>
                    <span class="text-xs text-muted-foreground">
                      {{ t('gallery.atoms', { count: block.atoms.length }) }}
                    </span>
                  </div>
                  <p class="mt-1.5 text-sm text-muted-foreground">{{ t(block.taglineKey) }}</p>
                </div>
              </div>
            }
          </div>
        </section>
      }

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
    </div>
  `,
  styles: `
    /* Covers the whole card from inside the title, so the card is one click target
       without the markup nesting one anchor inside another. z-index puts it over the
       thumbnail's fade, which is otherwise painted on top of it. */
    .stretched::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    /* Fades the crop line at the bottom of the thumbnail, so a block that is taller than
       the frame reads as continuing rather than as cut off. */
    .thumb::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(to bottom, transparent 62%, var(--background));
    }
  `,
})
export default class BlocksIndexPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  /*
   * Built here rather than reusing BLOCK_GROUPS because the gallery needs the blurb as
   * well as the heading, and the sidebar does not. Empty categories are dropped: an
   * announced-but-unbuilt section belongs in the "coming soon" list below, where it is
   * honest, not as a heading with nothing under it.
   */
  protected readonly categories = BLOCK_CATEGORIES.map(category => ({
    ...category,
    blocks: BLOCKS.filter(block => block.category === category.id),
  })).filter(category => category.blocks.length > 0);
  protected readonly upcoming = UPCOMING_BLOCKS;
  protected readonly stagger = MOTION.stagger;
}
