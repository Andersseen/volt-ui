import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VoltToggleGroup, VoltToggleGroupItem } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TOGGLE_GROUP_SNIPPET } from '../../../../lib/snippets';
import { TOGGLE_GROUP_USAGE } from '../../../../lib/snippets/usage';
import { TOGGLE_GROUP_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-toggle-group-demo',
  standalone: true,
  imports: [VoltToggleGroup, VoltToggleGroupItem, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.toggleGroup.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.toggleGroup.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-toggle-group [(value)]="value">
            <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
            <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
            <volt-toggle-group-item value="code">Code</volt-toggle-group-item>
          </volt-toggle-group>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="toggleGroupApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add toggle-group"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/toggle-group' })"
      />
    </div>
  `,
})
export default class ToggleGroupDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly toggleGroupApi = TOGGLE_GROUP_API;
  readonly code = TOGGLE_GROUP_SNIPPET;
  readonly usage = TOGGLE_GROUP_USAGE;
  readonly value = signal(['bold']);
}
