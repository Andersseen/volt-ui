import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltCheckbox, VoltLabel } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { CHECKBOX_SNIPPET } from '../../../../lib/snippets';

@Component({
  selector: 'app-checkbox-demo',
  standalone: true,
  imports: [VoltCheckbox, VoltLabel, CodePanel],
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxDemo {
  readonly checkboxCode = CHECKBOX_SNIPPET;
}
