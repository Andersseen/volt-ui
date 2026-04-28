import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltPopoverTrigger, VoltPopoverContent } from 'volt';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { POPOVER_SNIPPET } from '../../../../lib/snippets';
import { POPOVER_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-popover-demo',
  standalone: true,
  imports: [VoltPopoverTrigger, VoltPopoverContent, VoltButton, CodePanel],
  templateUrl: './popover.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverDemo {
  readonly popoverCode = POPOVER_SNIPPET;
  readonly popoverUsage = POPOVER_USAGE;
}
