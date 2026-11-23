import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VoltCard } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { CodePanel } from '@shared/components/code-panel';
import type { RecipeMetadata } from '../lib/recipes-metadata';
import { externalPackages } from '../lib/snippets/consumer-source';
import { RelatedComponents } from './related-components';

/**
 * The frame every recipe page shares: name, live recipe, what it is built from, and the source.
 *
 * Same shape as `BlockShowcase` and `LayoutShowcase`. The live recipe arrives through
 * `<ng-content>` so a page owns its own import and this component never needs the catalog.
 */
@Component({
  selector: 'app-recipe-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodePanel, RelatedComponents, VoltCard],
  template: `
    <div class="space-y-8">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-primary">
          {{ t('gallery.patterns.title') }}
        </p>
        <h1 class="mt-1.5 text-3xl font-bold tracking-tight">{{ t(recipe().labelKey) }}</h1>
      </div>

      <div class="rounded-xl border border-border bg-background/50 p-6 md:p-10">
        <ng-content />
      </div>

      <volt-card class="p-4 shadow-none">
        <h2 class="text-sm font-medium">{{ t('gallery.builtFrom') }}</h2>
        <app-related-components [atoms]="recipe().atoms" />
      </volt-card>

      <app-code-panel
        [title]="t('ui.codePanel.usage')"
        [code]="code()"
        [cliCommand]="installCommand()"
      />
    </div>
  `,
})
export class RecipeShowcase {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly recipe = input.required<RecipeMetadata>();
  readonly code = input.required<string>();

  /** Read off the source itself, so a new dependency cannot be left out of the instructions. */
  protected readonly installCommand = computed(() =>
    [
      'pnpm add',
      '@voltui/components',
      ...externalPackages(this.code()).filter(p => p !== '@voltui/components'),
    ].join(' ')
  );
}
