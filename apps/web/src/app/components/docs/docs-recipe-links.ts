import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltNativeButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';

export interface RecipeLink {
  /** Absolute URL on recipes.voltui.dev, already localized. */
  readonly href: string;
  readonly label: string;
}

/** "Recipes that use this component": links from a component page to complete workflows. */
@Component({
  selector: 'app-docs-recipe-links',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltNativeButton],
  host: { class: 'block' },
  template: `
    @if (links().length) {
      <nav [attr.aria-label]="t('ui.docs.recipes')">
        <p class="mb-3 text-sm font-semibold">{{ t('ui.docs.recipes') }}</p>
        <ul class="flex flex-wrap gap-2">
          @for (link of links(); track link.href) {
            <li>
              <a voltButton variant="outline" size="sm" [href]="link.href">{{ link.label }}</a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
})
export class DocsRecipeLinks {
  readonly links = input<readonly RecipeLink[]>([]);

  protected readonly t = injectAppI18n().t;
}
