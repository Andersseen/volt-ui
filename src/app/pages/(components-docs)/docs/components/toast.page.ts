import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltNativeButton, VoltToastService } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TOAST_SNIPPET } from '../../../../lib/snippets';
import { TOAST_USAGE } from '../../../../lib/snippets/usage';
import { TOAST_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '../../../../i18n/i18n';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [VoltNativeButton, CodePanel, ApiReference],
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
          class="p-8 border border-border rounded-lg bg-card/30 flex flex-wrap items-center justify-center gap-3"
        >
          <button voltButton type="button" (click)="save()">Show toast</button>
          <button voltButton variant="outline" type="button" (click)="copy()">Success</button>
          <button voltButton variant="outline" type="button" (click)="warn()">Warning</button>
          <button voltButton variant="outline" type="button" (click)="info()">Info</button>
          <button voltButton variant="destructive" type="button" (click)="fail()">Error</button>
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
  private readonly translations = injectAppI18n();
  private readonly toast = inject(VoltToastService);

  protected readonly t = this.translations.t;

  readonly toastApi = TOAST_API;
  readonly code = TOAST_SNIPPET;
  readonly usage = TOAST_USAGE;

  protected save(): void {
    this.toast.show({ title: 'Changes saved', description: 'Your workspace has been updated.' });
  }

  protected copy(): void {
    this.toast.success('Copied to clipboard');
  }

  protected warn(): void {
    this.toast.warning('Connection needs attention', {
      description: 'Reconnect your Cloudflare account.',
    });
  }

  protected info(): void {
    this.toast.info('New version available');
  }

  protected fail(): void {
    this.toast.error('Could not save', { description: 'Check your connection and try again.' });
  }
}
