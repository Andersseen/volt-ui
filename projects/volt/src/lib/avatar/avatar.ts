import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'volt-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted',
  },
  template: `<ng-content />`,
})
export class VoltAvatar {}
