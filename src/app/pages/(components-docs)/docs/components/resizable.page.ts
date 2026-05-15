import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltResizable, VoltResizablePanel, VoltResizableHandle, VoltSwitch } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { RESIZABLE_SNIPPET } from '../../../../lib/snippets';
import { RESIZABLE_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-resizable-demo',
  standalone: true,
  imports: [VoltResizable, VoltResizablePanel, VoltResizableHandle, VoltSwitch, CodePanel],
  templateUrl: './resizable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResizableDemo {
  readonly resizableCode = RESIZABLE_SNIPPET;
  readonly resizableUsage = RESIZABLE_USAGE;
  readonly darkMode = signal(false);
  readonly notifications = signal(false);
}
