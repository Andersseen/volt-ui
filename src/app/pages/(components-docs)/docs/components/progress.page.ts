import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltProgress, VoltProgressLabel, VoltProgressValue } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { PROGRESS_SNIPPET } from '../../../../lib/snippets';
import { PROGRESS_USAGE } from '../../../../lib/snippets/usage';
import { PROGRESS_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '../../../../i18n/i18n';

@Component({
  selector: 'app-progress-demo',
  standalone: true,
  imports: [VoltProgress, VoltProgressLabel, VoltProgressValue, CodePanel, ApiReference],
  templateUrl: './progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly progressApi = PROGRESS_API;
  readonly progressCode = PROGRESS_SNIPPET;
  readonly progressUsage = PROGRESS_USAGE;
  readonly value = signal(60);
}
