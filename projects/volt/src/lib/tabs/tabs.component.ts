import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpTabset } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpTabset,
      inputs: [
        'ngpTabsetValue: value',
        'ngpTabsetOrientation: orientation',
        'ngpTabsetActivateOnFocus: activateOnFocus',
      ],
      outputs: ['ngpTabsetValueChange: valueChange'],
    },
  ],
  template: `<ng-content></ng-content>`,
  host: {
    class: 'w-full block',
  },
})
export class VoltTabs {}
