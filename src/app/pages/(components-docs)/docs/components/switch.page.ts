import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltSwitch, VoltLabel } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { SWITCH_SNIPPET } from '../../../../lib/snippets';
import { SWITCH_USAGE } from '../../../../lib/snippets/usage';
import { SWITCH_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-switch-demo',
  standalone: true,
  imports: [VoltSwitch, VoltLabel, CodePanel, ApiReference],
  templateUrl: './switch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwitchDemo {
  readonly switchApi = SWITCH_API;
  readonly switchCode = SWITCH_SNIPPET;
  readonly switchUsage = SWITCH_USAGE;
  readonly enabled = signal(false);
}
