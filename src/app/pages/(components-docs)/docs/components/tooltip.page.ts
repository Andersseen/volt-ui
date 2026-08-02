import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltTooltip, VoltTooltipContent } from 'volt';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TOOLTIP_SNIPPET } from '../../../../lib/snippets';
import { TOOLTIP_USAGE } from '../../../../lib/snippets/usage';
import { TOOLTIP_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-tooltip-demo',
  standalone: true,
  imports: [VoltTooltip, VoltTooltipContent, VoltButton, CodePanel, ApiReference],
  templateUrl: './tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipDemo {
  readonly tooltipApi = TOOLTIP_API;
  readonly tooltipCode = TOOLTIP_SNIPPET;
  readonly tooltipUsage = TOOLTIP_USAGE;
}
