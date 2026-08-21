import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltToolbar, VoltToolbarButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TOOLBAR_SNIPPET } from '../../../../lib/snippets';
import { TOOLBAR_USAGE } from '../../../../lib/snippets/usage';
import { TOOLBAR_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-toolbar-demo',
  standalone: true,
  imports: [VoltToolbar, VoltToolbarButton, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.toolbar.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.toolbar.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-toolbar>
            <button voltToolbarButton>Bold</button>
            <button voltToolbarButton>Italic</button>
            <button voltToolbarButton>Save</button>
          </volt-toolbar>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="toolbarApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add toolbar"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/toolbar' })"
      />
    </div>
  `,
})
export default class ToolbarDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly toolbarApi = TOOLBAR_API;
  readonly code = TOOLBAR_SNIPPET;
  readonly usage = TOOLBAR_USAGE;
}
