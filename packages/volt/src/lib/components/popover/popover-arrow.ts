import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpPopoverArrow } from 'ng-primitives/popover';

@Component({
  selector: 'volt-popover-arrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpPopoverArrow],
  template: `
    <span
      ngpPopoverArrow
      [ngpPopoverArrowPadding]="padding()"
      class="block h-2 w-2 rotate-45 border border-border bg-popover"
      [class.hidden]="hidden()"
    ></span>
  `,
})
export class VoltPopoverArrow {
  readonly padding = input<number | undefined>(4);
  readonly hidden = input(false, { transform: booleanAttribute });
}
