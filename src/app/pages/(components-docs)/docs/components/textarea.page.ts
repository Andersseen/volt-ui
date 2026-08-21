import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VoltTextarea } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TEXTAREA_SNIPPET } from '../../../../lib/snippets';
import { TEXTAREA_USAGE } from '../../../../lib/snippets/usage';
import { TEXTAREA_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-textarea-demo',
  standalone: true,
  imports: [VoltTextarea, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.textarea.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.textarea.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div class="p-8 border border-border rounded-lg bg-card/30 flex justify-center">
          <div class="w-full max-w-md space-y-3">
            <volt-textarea [(value)]="message" [rows]="4" />
            <p class="text-sm text-muted-foreground">{{ message().length }} characters</p>
          </div>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="textareaApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add textarea"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/textarea' })"
      />
    </div>
  `,
})
export default class TextareaDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly textareaApi = TEXTAREA_API;
  readonly code = TEXTAREA_SNIPPET;
  readonly usage = TEXTAREA_USAGE;
  readonly message = signal('Write a short note...');
}
