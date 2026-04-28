import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltSwitch, VoltLabel } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { SWITCH_SNIPPET } from '../../../../lib/snippets';
import { SWITCH_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-switch-demo',
  standalone: true,
  imports: [VoltSwitch, VoltLabel, CodePanel],
  templateUrl: './switch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwitchDemo {
  readonly switchCode = SWITCH_SNIPPET;
  readonly switchUsage = SWITCH_USAGE;
}
