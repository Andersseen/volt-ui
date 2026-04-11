import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltProgress } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { PROGRESS_SNIPPET } from '../../../../lib/snippets';

@Component({
  selector: 'app-progress-demo',
  standalone: true,
  imports: [VoltProgress, CodePanel],
  templateUrl: './progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressDemo {
  readonly progressCode = PROGRESS_SNIPPET;
  readonly value = signal(60);
}
