import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VoltCard, VoltCardContent, VoltNativeButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import type { ComponentMetadata } from '../../../lib/component-metadata';
import { ComponentPreview } from '../../component-preview';

/** One component in the carousel: a live miniature, its name and summary, and a link to its page. */
@Component({
  selector: 'app-showcase-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, VoltCard, VoltCardContent, VoltNativeButton, ComponentPreview],
  host: { class: 'block' },
  template: `
    <volt-card class="flex h-full flex-col overflow-hidden rounded-2xl">
      <div class="grid h-56 place-items-center border-b border-border bg-muted/40 p-6">
        <app-component-preview [name]="component().name" />
      </div>
      <volt-card-content class="flex flex-1 flex-col gap-2 p-6">
        <h3 class="text-lg font-semibold">{{ title() }}</h3>
        @if (component().descriptionKey; as key) {
          <p class="text-sm text-muted-foreground">{{ t(key) }}</p>
        }
        <a
          voltButton
          variant="link"
          class="mt-auto self-start px-0"
          [routerLink]="path(component().path)"
        >
          {{ t('catalog.learnMore') }}
        </a>
      </volt-card-content>
    </volt-card>
  `,
})
export class ShowcaseCard {
  readonly component = input.required<ComponentMetadata>();

  private readonly translations = injectAppI18n();
  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  protected title(): string {
    const { labelKey, label, name } = this.component();
    return labelKey ? this.t(labelKey) : (label ?? name);
  }
}
