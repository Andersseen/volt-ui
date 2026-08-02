import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltRadioGroup, VoltRadioItem } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { RADIO_SNIPPET } from '../../../../lib/snippets';
import { RADIO_USAGE } from '../../../../lib/snippets/usage';
import { RADIO_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-radio-demo',
  standalone: true,
  imports: [VoltRadioGroup, VoltRadioItem, CodePanel, ApiReference],
  templateUrl: './radio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioDemo {
  readonly radioApi = RADIO_API;
  readonly radioCode = RADIO_SNIPPET;
  readonly radioUsage = RADIO_USAGE;
}
