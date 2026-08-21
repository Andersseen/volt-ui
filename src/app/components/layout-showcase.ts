import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LayoutMetadata } from '../lib/layouts-metadata';
import { CodePanel } from './code-panel';
import { Translations } from '../i18n/translations';

/**
 * The frame every layout page shares.
 *
 * Deliberately the same shape as `BlockShowcase`, with one difference that carries the
 * whole distinction between the two tabs: this one leads with the structure in words
 * rather than with what moves. A layout is chosen by whether its arrangement matches the
 * screen you have to build, so that is what the page has to answer first.
 */
@Component({
  selector: 'app-layout-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CodePanel],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t(layout().labelKey) }}</h1>
        <p class="mt-2 text-lg text-muted-foreground">{{ t(layout().taglineKey) }}</p>
      </div>

      <div class="overflow-hidden rounded-xl border border-border">
        <ng-content />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <h2 class="text-sm font-medium">{{ t('gallery.arrangement') }}</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">{{ t(layout().structureKey) }}</p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <h2 class="text-sm font-medium">{{ t('gallery.assembledFrom') }}</h2>
          <ul class="mt-2 flex flex-wrap gap-1.5">
            @for (atom of layout().atoms; track atom.name) {
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
        [title]="t('gallery.layoutSource')"
        [code]="code()"
        [description]="t('gallery.layoutSourceNote')"
      />

      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <p class="text-sm text-muted-foreground">
          {{ t('gallery.layoutUnbrandedNote') }}
          <a routerLink="/docs/blocks" class="text-primary underline-offset-4 hover:underline">
            {{ t('gallery.blocksGalleryLink') }}
          </a>
          {{ t('gallery.isTheOtherTab') }}
        </p>
      </div>
    </div>
  `,
})
export class LayoutShowcase {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly layout = input.required<LayoutMetadata>();
  readonly code = input.required<string>();
}
