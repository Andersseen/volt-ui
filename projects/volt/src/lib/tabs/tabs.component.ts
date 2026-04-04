import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpTabset, provideTabsetState } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabsetState()],
  host: {
    class: 'w-full block',
  },
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
  template: ` <ng-content /> `,
})
export class VoltTabs {
  readonly value = model<string | undefined>(undefined);
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly activateOnFocus = input<boolean>(true);
}
