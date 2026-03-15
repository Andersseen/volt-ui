import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpRadioGroup } from 'ng-primitives/radio';

@Component({
  selector: 'volt-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpRadioGroup,
      inputs: ['ngpRadioGroupValue: value', 'ngpRadioGroupDisabled: disabled'],
      outputs: ['ngpRadioGroupValueChange: valueChange'],
    },
  ],
  host: {
    '[attr.aria-orientation]': 'orientation()',
    '[class.flex-col]': 'orientation() === "vertical"',
    '[class.flex-row]': 'orientation() === "horizontal"',
    class: 'flex gap-2',
  },
  template: `<ng-content />`,
})
export class VoltRadioGroup {
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
  readonly value = model<string | null>(null);
  readonly disabled = input<boolean>(false);
}
