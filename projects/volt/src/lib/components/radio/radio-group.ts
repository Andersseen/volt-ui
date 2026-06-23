import { booleanAttribute, ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpRadioGroup, provideRadioGroupState } from 'ng-primitives/radio';
import type { NgpOrientation } from 'ng-primitives/common';

@Component({
  selector: 'volt-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideRadioGroupState()],
  host: {
    class: 'flex gap-2',
    '[attr.aria-orientation]': 'orientation()',
    '[class.flex-col]': 'orientation() === "vertical"',
    '[class.flex-row]': 'orientation() === "horizontal"',
  },
  hostDirectives: [
    {
      directive: NgpRadioGroup,
      inputs: [
        'id: id',
        'ngpRadioGroupValue: value',
        'ngpRadioGroupDisabled: disabled',
        'ngpRadioGroupOrientation: orientation',
        'ngpRadioGroupCompareWith: compareWith',
      ],
      outputs: ['ngpRadioGroupValueChange: valueChange'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltRadioGroup {
  readonly id = input<string>();
  readonly orientation = input<NgpOrientation>('vertical');
  readonly value = model<string | null>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly compareWith = input<(a: string | null, b: string | null) => boolean>(Object.is);
}
