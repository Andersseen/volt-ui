import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';

@Component({
  selector: 'volt-select-label',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`
})
export class VoltSelectLabel {
  @HostBinding('class') get hostClass() {
    return 'py-1.5 pl-8 pr-2 text-sm font-semibold text-muted-foreground';
  }
}
