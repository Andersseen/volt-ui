import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltProgress } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { PROGRESS_SNIPPET } from '../../../../lib/snippets';
import { PROGRESS_USAGE } from '../../../../lib/snippets/usage';
import { PROGRESS_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-progress-demo',
  standalone: true,
  imports: [VoltProgress, CodePanel, ApiReference],
  templateUrl: './progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressDemo {
  readonly progressApi = PROGRESS_API;
  readonly progressCode = PROGRESS_SNIPPET;
  readonly progressUsage = PROGRESS_USAGE;
  readonly value = signal(60);
}
