import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltInput, VoltTextarea, VoltLabel } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { INPUT_SNIPPET } from '../../../../lib/snippets';

@Component({
  selector: 'app-input-demo',
  standalone: true,
  imports: [VoltInput, VoltTextarea, VoltLabel, CodePanel],
  templateUrl: './input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputDemo {
  readonly inputCode = INPUT_SNIPPET;
}
