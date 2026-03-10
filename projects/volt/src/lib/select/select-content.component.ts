import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { NgpSelectDropdown } from 'ng-primitives/select';

@Component({
  selector: 'volt-select-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpSelectDropdown],
  template: `
    <div class="p-1 w-full flex flex-col">
      <ng-content></ng-content>
    </div>
  `
})
export class VoltSelectContent {
  @HostBinding('class') get hostClass() {
    return 'absolute block z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface text-surface-foreground shadow-md animate-in fade-in-80 zoom-in-95';
  }
}
