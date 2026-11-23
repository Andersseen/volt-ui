import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LayoutMetadata } from '../lib/layouts-metadata';
import { externalPackages } from '../lib/snippets/consumer-source';
import { RelatedComponents } from './related-components';
import { CodePanel } from '@shared/components/code-panel';
import { VoltAlert, VoltAlertDescription, VoltCard } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';

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
  imports: [RouterLink, CodePanel, RelatedComponents, VoltAlert, VoltAlertDescription, VoltCard],
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
        <volt-card class="p-4 shadow-none">
          <h2 class="text-sm font-medium">{{ t('gallery.arrangement') }}</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">{{ t(layout().structureKey) }}</p>
        </volt-card>
        <volt-card class="p-4 shadow-none">
          <h2 class="text-sm font-medium">{{ t('gallery.assembledFrom') }}</h2>
          <app-related-components [atoms]="layout().atoms" />
        </volt-card>
      </div>

      <app-code-panel
        [title]="t('gallery.layoutSource')"
        [code]="code()"
        [cliCommand]="installCommand()"
        [description]="t('gallery.layoutSourceNote')"
      />

      <volt-alert>
        <volt-alert-description>
          {{ t('gallery.layoutUnbrandedNote') }}
          <a [routerLink]="path('/blocks')" class="text-primary underline-offset-4 hover:underline">
            {{ t('gallery.blocksGalleryLink') }}
          </a>
          {{ t('gallery.isTheOtherTab') }}
        </volt-alert-description>
      </volt-alert>
    </div>
  `,
})
export class LayoutShowcase {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  readonly layout = input.required<LayoutMetadata>();
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
}
