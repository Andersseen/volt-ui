import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
  imports: [CodePanel, RelatedComponents],
  template: `
    <div class="space-y-8">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-primary">Recipes</p>
        <h1 class="mt-1.5 text-3xl font-bold tracking-tight">{{ recipe().label }}</h1>
      </div>

      <div class="rounded-xl border border-border bg-background/50 p-6 md:p-10">
        <ng-content />
      </div>

      <div class="rounded-lg border border-border bg-muted/20 p-4">
        <h2 class="text-sm font-medium">{{ t('gallery.builtFrom') }}</h2>
        <app-related-components [atoms]="recipe().atoms" />
      </div>

      <app-code-panel
        [title]="t('ui.codePanel.usage')"
        [code]="code()"
        [cliCommand]="installCommand()"
        [tabbed]="true"
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
