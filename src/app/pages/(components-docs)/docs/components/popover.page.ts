import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltPopoverTrigger, VoltPopoverContent } from 'volt';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { POPOVER_SNIPPET } from '../../../../lib/snippets';
import { POPOVER_USAGE } from '../../../../lib/snippets/usage';
import { POPOVER_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-popover-demo',
  standalone: true,
  imports: [VoltPopoverTrigger, VoltPopoverContent, VoltButton, CodePanel, ApiReference],
  templateUrl: './popover.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverDemo {
  readonly popoverApi = POPOVER_API;
  readonly popoverCode = POPOVER_SNIPPET;
  readonly popoverUsage = POPOVER_USAGE;
}
