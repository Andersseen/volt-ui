import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltCheckbox, VoltLabel } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { CHECKBOX_SNIPPET } from '../../../../lib/snippets';
import { CHECKBOX_USAGE } from '../../../../lib/snippets/usage';
import { CHECKBOX_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-checkbox-demo',
  standalone: true,
  imports: [VoltCheckbox, VoltLabel, CodePanel, ApiReference],
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxDemo {
  readonly checkboxApi = CHECKBOX_API;
  readonly checkboxCode = CHECKBOX_SNIPPET;
  readonly checkboxUsage = CHECKBOX_USAGE;
}
