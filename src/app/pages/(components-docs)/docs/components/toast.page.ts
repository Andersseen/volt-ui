import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import {
  NgpToastManager,
  VoltButton,
  VoltToast,
  VoltToastClose,
  VoltToastDescription,
  VoltToastTitle,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TOAST_SNIPPET } from '../../../../lib/snippets';
import { TOAST_USAGE } from '../../../../lib/snippets/usage';
import { TOAST_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [
    VoltButton,
    VoltToast,
    VoltToastTitle,
    VoltToastDescription,
    VoltToastClose,
    CodePanel,
    ApiReference,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.toast.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">{{ t('components.toast.description') }}</p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-button (click)="showToast()">Show toast</volt-button>

          <ng-template #toastTemplate>
            <volt-toast>
              <div>
                <volt-toast-title>Changes saved</volt-toast-title>
                <volt-toast-description>Your workspace has been updated.</volt-toast-description>
              </div>
              <volt-toast-close />
            </volt-toast>
          </ng-template>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="toastApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add toast"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/toast' })"
      />
    </div>
  `,
})
export default class ToastDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly toastApi = TOAST_API;
  readonly code = TOAST_SNIPPET;
  readonly usage = TOAST_USAGE;
  @ViewChild('toastTemplate', { read: TemplateRef }) private toastTemplate?: TemplateRef<void>;
  private readonly toastManager = inject(NgpToastManager);

  showToast() {
    if (!this.toastTemplate) return;

    this.toastManager.show(this.toastTemplate, {
      duration: 3000,
      placement: 'bottom-end',
    });
  }
}
