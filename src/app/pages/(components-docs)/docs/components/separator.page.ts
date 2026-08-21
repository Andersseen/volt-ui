import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltSeparator } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { SEPARATOR_SNIPPET } from '../../../../lib/snippets';
import { SEPARATOR_USAGE } from '../../../../lib/snippets/usage';
import { SEPARATOR_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-separator-demo',
  standalone: true,
  imports: [VoltSeparator, CodePanel, ApiReference],
  templateUrl: './separator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SeparatorDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly separatorApi = SEPARATOR_API;
  readonly separatorCode = SEPARATOR_SNIPPET;
  readonly separatorUsage = SEPARATOR_USAGE;
}
