import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltMeter, VoltMeterTrack, VoltMeterIndicator } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { METER_SNIPPET } from '../../../../lib/snippets';
import { METER_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-meter-demo',
  standalone: true,
  imports: [VoltMeter, VoltMeterTrack, VoltMeterIndicator, CodePanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Meter</h1>
        <p class="text-base text-muted-foreground mt-2">
          Displays a scalar measurement within a known range.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <div class="w-full max-w-sm space-y-3">
            <volt-meter [value]="72">
              <volt-meter-track>
                <volt-meter-indicator />
              </volt-meter-track>
            </volt-meter>
            <p class="text-sm text-muted-foreground text-center">72 of 100 capacity</p>
          </div>
        </div>
      </app-code-panel>
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add meter"
        description="Copy this code to your project. The component uses ng-primitives/meter."
      />
    </div>
  `,
})
export default class MeterDemo {
  readonly code = METER_SNIPPET;
  readonly usage = METER_USAGE;
}
