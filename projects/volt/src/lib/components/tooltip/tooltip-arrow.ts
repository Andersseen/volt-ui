import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpTooltipArrow } from 'ng-primitives/tooltip';

@Component({
  selector: 'volt-tooltip-arrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpTooltipArrow],
  template: `
    <span
      ngpTooltipArrow
      [ngpTooltipArrowPadding]="padding()"
      class="block h-2 w-2 rotate-45 bg-[var(--foreground)]"
      [class.hidden]="hidden()"
    ></span>
  `,
})
export class VoltTooltipArrow {
  readonly padding = input<number | undefined>(4);
  readonly hidden = input(false, { transform: booleanAttribute });
}
