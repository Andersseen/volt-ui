import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAvatar } from 'ng-primitives/avatar';

@Component({
  selector: 'volt-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpAvatar],
  host: {
    class: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted',
  },
  template: `<ng-content />`,
})
export class VoltAvatar {}
