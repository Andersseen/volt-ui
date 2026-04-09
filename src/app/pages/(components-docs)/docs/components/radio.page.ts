import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltRadioGroup, VoltRadioItem } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { RADIO_SNIPPET } from '../../../../lib/snippets';

@Component({
  selector: 'app-radio-demo',
  standalone: true,
  imports: [VoltRadioGroup, VoltRadioItem, CodePanel],
  templateUrl: './radio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioDemo {
  readonly radioCode = RADIO_SNIPPET;
}
