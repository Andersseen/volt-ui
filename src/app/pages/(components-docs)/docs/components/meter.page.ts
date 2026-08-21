import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltMeter,
  VoltMeterIndicator,
  VoltMeterLabel,
  VoltMeterTrack,
  VoltMeterValue,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { METER_SNIPPET } from '../../../../lib/snippets';
import { METER_USAGE } from '../../../../lib/snippets/usage';
import { METER_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-meter-demo',
  standalone: true,
  imports: [
    VoltMeter,
    VoltMeterTrack,
    VoltMeterIndicator,
    VoltMeterLabel,
    VoltMeterValue,
    CodePanel,
    ApiReference,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.meter.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">{{ t('components.meter.description') }}</p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <div class="w-full max-w-sm space-y-3">
            <volt-meter [value]="72">
              <div class="mb-2 flex items-center justify-between gap-3">
                <volt-meter-label>Capacity</volt-meter-label>
                <volt-meter-value>72 of 100 capacity</volt-meter-value>
              </div>
              <volt-meter-track>
                <volt-meter-indicator />
              </volt-meter-track>
            </volt-meter>
          </div>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="meterApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add meter"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/meter' })"
      />
    </div>
  `,
})
export default class MeterDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly meterApi = METER_API;
  readonly code = METER_SNIPPET;
  readonly usage = METER_USAGE;
}
