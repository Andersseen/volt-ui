import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltInputOtp } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { INPUT_OTP_SNIPPET } from '../../../../lib/snippets';
import { INPUT_OTP_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-input-otp-demo',
  standalone: true,
  imports: [VoltInputOtp, CodePanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Input OTP</h1>
        <p class="text-base text-muted-foreground mt-2">
          One-time password input for verification and PIN flows.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex flex-col items-center gap-4"
        >
          <volt-input-otp [(value)]="codeValue" [length]="6" />
          <p class="text-sm text-muted-foreground">Code: {{ codeValue() || 'empty' }}</p>
        </div>
      </app-code-panel>
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add input-otp"
        description="Copy this code to your project. The component uses ng-primitives/input-otp."
      />
    </div>
  `,
})
export default class InputOtpDemo {
  readonly code = INPUT_OTP_SNIPPET;
  readonly usage = INPUT_OTP_USAGE;
  readonly codeValue = signal('');
}
