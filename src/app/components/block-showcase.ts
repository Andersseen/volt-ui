import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { categoryFor, type BlockMetadata } from '../lib/blocks-metadata';
import { CodePanel } from './code-panel';
import { Translations } from '../i18n/translations';

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
  imports: [RouterLink, CodePanel],
  template: `
    <div class="space-y-8">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-primary">
          {{ t(category().labelKey) }}
        </p>
        <h1 class="mt-1.5 text-3xl font-bold tracking-tight">{{ t(block().labelKey) }}</h1>
        <p class="mt-2 text-lg text-muted-foreground">{{ t(block().taglineKey) }}</p>
      </div>

      <div class="overflow-hidden rounded-xl border border-border">
        <ng-content />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <h2 class="text-sm font-medium">{{ t('gallery.whatMoves') }}</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">{{ t(block().motionKey) }}</p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <h2 class="text-sm font-medium">{{ t('gallery.builtFrom') }}</h2>
          <ul class="mt-2 flex flex-wrap gap-1.5">
            @for (atom of block().atoms; track atom.name) {
              <li>
                <a
                  [routerLink]="atom.path"
                  class="inline-flex rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {{ atom.name }}
                </a>
              </li>
            }
          </ul>
        </div>
      </div>

      <app-code-panel
        [title]="t('gallery.blockSource')"
        [code]="code()"
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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly block = input.required<BlockMetadata>();
  readonly code = input.required<string>();

  /** Names the category above the title, so a block page says where it sits in the set. */
  protected readonly category = computed(() => categoryFor(this.block()));
}
