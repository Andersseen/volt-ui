import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltSeparator } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { SEPARATOR_SNIPPET } from '../../../../lib/snippets';
import { SEPARATOR_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-separator-demo',
  standalone: true,
  imports: [VoltSeparator, CodePanel],
  templateUrl: './separator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SeparatorDemo {
  readonly separatorCode = SEPARATOR_SNIPPET;
  readonly separatorUsage = SEPARATOR_USAGE;
}
