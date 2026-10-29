import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { categoryFor, type BlockMetadata } from '../lib/blocks-metadata';
import { externalPackages } from '../lib/snippets/consumer-source';
import { RelatedComponents } from './related-components';
import { CodePanel } from '@shared/components/code-panel';
import { injectAppI18n } from '@shared/i18n/i18n';

/**
 * The frame every block page shares: heading, live section, what moves, and the source.
 *
 * The block itself arrives through `<ng-content>` rather than a `@switch` on the slug, so
 * a page owns its own import and this component never has to know the catalog exists.
 *
 * The preview is a plain bordered box at the column's natural width, not a scaled or
 * iframed one. Tailwind's breakpoints answer to the viewport, so shrinking the frame
 * would show the desktop layout squeezed rather than the mobile layout — a preview that
 * lies about what the visitor would ship.
 */
@Component({
  selector: 'app-block-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodePanel, RelatedComponents],
  template: `
    <div class="space-y-8">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-primary">
          {{ t(category().labelKey) }}
        </p>
        <h1 class="mt-1.5 text-3xl font-bold tracking-tight">{{ t(block().labelKey) }}</h1>
        <p class="mt-2 text-lg text-muted-foreground">{{ t(block().taglineKey) }}</p>
      </div>

      <!-- overflow-clip, not hidden: hidden makes a scroll container, which stops a block's
             position: sticky (scroll-story) from sticking to the page. -->
      <div class="overflow-clip rounded-xl border border-border">
        <ng-content />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <h2 class="text-sm font-medium">{{ t('gallery.whatMoves') }}</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">{{ t(block().motionKey) }}</p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <h2 class="text-sm font-medium">{{ t('gallery.builtFrom') }}</h2>
          <app-related-components [atoms]="block().atoms" />
        </div>
      </div>

      <app-code-panel
        [title]="t('gallery.blockSource')"
        [code]="code()"
        [cliCommand]="installCommand()"
        [description]="t('gallery.blockSourceNote')"
      />

      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <!-- The CSS media query is a literal, so it is passed in rather than translated. -->
        <p class="text-sm text-muted-foreground">
          {{ t('gallery.blockThemeNote', { reducedMotion: 'prefers-reduced-motion' }) }}
        </p>
      </div>
    </div>
  `,
})
export class BlockShowcase {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly block = input.required<BlockMetadata>();
  readonly code = input.required<string>();

  /**
   * The packages the copied file imports, read off the source itself so a new dependency
   * cannot be left out of the instructions.
   */
  protected readonly installCommand = computed(() =>
    [
      'pnpm add',
      '@voltui/components',
      ...externalPackages(this.code()).filter(p => p !== '@voltui/components'),
    ].join(' ')
  );

  /** Names the category above the title, so a block page says where it sits in the set. */
  protected readonly category = computed(() => categoryFor(this.block()));
}
