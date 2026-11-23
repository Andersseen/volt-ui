import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { categoryFor, type BlockMetadata } from '../lib/blocks-metadata';
import { externalPackages } from '../lib/snippets/consumer-source';
import { RelatedComponents } from './related-components';
import { CodePanel } from '@shared/components/code-panel';
import { VoltAlert, VoltAlertDescription, VoltCard } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';

export interface BlockFile {
  /** The file name the block imports it by, e.g. `contact-map.data.ts`. */
  readonly name: string;
  readonly code: string;
}

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
  imports: [CodePanel, RelatedComponents, VoltAlert, VoltAlertDescription, VoltCard],
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
        <volt-card class="p-4 shadow-none">
          <h2 class="text-sm font-medium">{{ t('gallery.whatMoves') }}</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">{{ t(block().motionKey) }}</p>
        </volt-card>
        <volt-card class="p-4 shadow-none">
          <h2 class="text-sm font-medium">{{ t('gallery.builtFrom') }}</h2>
          <app-related-components [atoms]="block().atoms" />
        </volt-card>
      </div>

      <app-code-panel
        [title]="t('gallery.blockSource')"
        [code]="code()"
        [cliCommand]="installCommand()"
        [description]="t('gallery.blockSourceNote')"
      />

      <!-- Files the block imports beside itself (generated data), copied along with it. -->
      @for (file of files(); track file.name) {
        <app-code-panel [title]="file.name" [code]="file.code" />
      }

      <volt-alert>
        <!-- The CSS media query is a literal, so it is passed in rather than translated. -->
        <volt-alert-description>
          {{ t('gallery.blockThemeNote', { reducedMotion: 'prefers-reduced-motion' }) }}
        </volt-alert-description>
      </volt-alert>
    </div>
  `,
})
export class BlockShowcase {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly block = input.required<BlockMetadata>();
  readonly code = input.required<string>();
  /** Sibling files the block imports (`./<name>`), shown under it so the copy is complete. */
  readonly files = input<readonly BlockFile[]>([]);

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
