import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltCard } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { COMPONENTS } from '../../lib/component-metadata';

/**
 * Stable and beta components, derived from the catalog so a new or promoted component cannot be
 * missed by the Markdown introduction (`::demo[component-catalog]`).
 */
@Component({
  selector: 'app-component-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard],
  template: `
    <div class="grid gap-4 md:grid-cols-2">
      <volt-card class="p-4">
        <h3 class="mb-2 font-medium text-success">{{ t('guide.intro.stableLabel') }}</h3>
        <p class="mb-3 text-sm text-muted-foreground">{{ t('guide.intro.stableBody') }}</p>
        <p class="font-mono text-xs leading-5 text-muted-foreground">{{ stableNames }}</p>
      </volt-card>
      @if (betaNames) {
        <volt-card class="p-4">
          <h3 class="mb-2 font-medium text-info">{{ t('catalog.beta') }}</h3>
          <p class="mb-3 text-sm text-muted-foreground">{{ t('catalog.betaBody') }}</p>
          <p class="font-mono text-xs leading-5 text-muted-foreground">{{ betaNames }}</p>
        </volt-card>
      }
    </div>
  `,
})
export class ComponentCatalog {
  protected readonly t = injectAppI18n().t;
  protected readonly stableNames = namesWith('stable');
  protected readonly betaNames = namesWith('beta');
}

function namesWith(stability: (typeof COMPONENTS)[number]['stability']): string {
  return COMPONENTS.filter(component => component.stability === stability)
    .map(component => component.name)
    .sort()
    .join(', ');
}
