import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltInput, VoltTextarea, VoltLabel } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { INPUT_SNIPPET } from '../../../../lib/snippets';
import { INPUT_USAGE } from '../../../../lib/snippets/usage';
import { INPUT_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-input-demo',
  standalone: true,
  imports: [VoltInput, VoltTextarea, VoltLabel, CodePanel, ApiReference],
  templateUrl: './input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly inputApi = INPUT_API;
  readonly inputCode = INPUT_SNIPPET;
  readonly inputUsage = INPUT_USAGE;
}
