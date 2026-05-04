import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpListboxHeader } from 'ng-primitives/listbox';

@Component({
  selector: 'volt-listbox-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpListboxHeader,
      inputs: ['id'],
    },
  ],
  host: {
    class: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
  },
  template: `<ng-content />`,
})
export class VoltListboxHeader {
  readonly id = input<string>();
}
