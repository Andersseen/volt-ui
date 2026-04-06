import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltTooltip, VoltTooltipContent } from 'volt';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { TOOLTIP_SNIPPET } from '../../../../lib/snippets';

@Component({
  selector: 'app-tooltip-demo',
  standalone: true,
  imports: [VoltTooltip, VoltTooltipContent, VoltButton, CodePanel],
  templateUrl: './tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipDemo {
  readonly tooltipCode = TOOLTIP_SNIPPET;
}
