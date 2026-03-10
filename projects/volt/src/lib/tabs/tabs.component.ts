import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpTabset } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpTabset],
  template: `<ng-content></ng-content>`,
  host: {
    class: 'w-full',
  },
})
export class VoltTabs {}
