import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VoltInputOtp } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { INPUT_OTP_SNIPPET } from '../../../../lib/snippets';
import { INPUT_OTP_USAGE } from '../../../../lib/snippets/usage';
import { INPUT_OTP_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-input-otp-demo',
  standalone: true,
  imports: [VoltInputOtp, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.inputOtp.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.inputOtp.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex flex-col items-center gap-4"
        >
          <volt-input-otp [(value)]="codeValue" [length]="6" />
          <p class="text-sm text-muted-foreground">Code: {{ codeValue() || 'empty' }}</p>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="inputOtpApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add input-otp"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/input-otp' })"
      />
    </div>
  `,
})
export default class InputOtpDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly inputOtpApi = INPUT_OTP_API;
  readonly code = INPUT_OTP_SNIPPET;
  readonly usage = INPUT_OTP_USAGE;
  readonly codeValue = signal('');
}
