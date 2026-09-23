import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltAlert, VoltAlertDescription, VoltAlertTitle, VoltNativeButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { ALERT_SNIPPET } from '../../../../lib/snippets';
import { ALERT_USAGE } from '../../../../lib/snippets/usage';
import { ALERT_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '../../../../i18n/i18n';

// The heading is the component name, which is identical in every locale (as every
// `components.*.title` is). Switch it to t('components.alert.title') and add a description
// once those keys exist in Glossa — see specs/plans/v1.1.md "Glossa keys pending".
@Component({
  selector: 'app-alert-demo',
  standalone: true,
  imports: [
    VoltAlert,
    VoltAlertTitle,
    VoltAlertDescription,
    VoltNativeButton,
    CodePanel,
    ApiReference,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Alert</h1>

      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div class="grid gap-4 p-6 md:p-10 border border-border/50 rounded-xl bg-background/50">
          <volt-alert variant="warning">
            <svg
              slot="icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              />
            </svg>
            <volt-alert-title>Connection needs attention</volt-alert-title>
            <volt-alert-description>Reconnect your Cloudflare account.</volt-alert-description>
            <button slot="action" voltButton variant="outline" size="sm" type="button">
              Reconnect
            </button>
          </volt-alert>

          <volt-alert variant="info">
            <svg
              slot="icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <volt-alert-title>New version available</volt-alert-title>
            <volt-alert-description
              >Volt UI 1.1 adds Alert, Spinner and a toast service.</volt-alert-description
            >
          </volt-alert>

          <volt-alert variant="success" role="status">
            <svg
              slot="icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <volt-alert-title>Deployment finished</volt-alert-title>
          </volt-alert>

          <volt-alert variant="destructive" role="alert">
            <svg
              slot="icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <volt-alert-title>Payment failed</volt-alert-title>
            <volt-alert-description
              >Update your card to keep the workspace active.</volt-alert-description
            >
          </volt-alert>

          <volt-alert>
            <volt-alert-title>Heads up</volt-alert-title>
            <volt-alert-description
              >The default variant sits on the surface colour.</volt-alert-description
            >
          </volt-alert>
        </div>
      </app-code-panel>

      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="api" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add alert"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'class-variance-authority' })"
      />
    </div>
  `,
})
export default class AlertDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly api = ALERT_API;
  readonly code = ALERT_SNIPPET;
  readonly usage = ALERT_USAGE;
}
