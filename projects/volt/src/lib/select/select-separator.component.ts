import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';

@Component({
  selector: 'volt-select-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``
})
export class VoltSelectSeparator {
  @HostBinding('class') get hostClass() {
    return 'block -mx-1 my-1 h-px bg-muted';
  }
}
