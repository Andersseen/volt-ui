import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { NgpRadioGroup, provideRadioGroupState } from 'ng-primitives/radio';

@Component({
  selector: 'volt-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpRadioGroup],
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
      inputs: ['ngpRadioGroupValue: value', 'ngpRadioGroupDisabled: disabled'],
      outputs: ['ngpRadioGroupValueChange: valueChange'],
    },
  ],
  template: ` <ng-content /> `,
})
export class VoltRadioGroup {
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
  readonly value = model<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly valueChange = output<string | null>();
}
