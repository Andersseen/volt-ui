import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpSelectDropdown } from 'ng-primitives/select';

@Component({
  selector: 'volt-select-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSelectDropdown],
  template: `
    <div
      ngpSelectDropdown
      class="absolute block z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface text-surface-foreground shadow-md animate-in fade-in-80 zoom-in-95"
    >
      <div class="p-1 w-full flex flex-col">
        <ng-content />
      </div>
    </div>
  `,
})
export class VoltSelectContent {}
