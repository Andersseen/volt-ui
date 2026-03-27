import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { NgpRadioGroup } from 'ng-primitives/radio';

@Component({
  selector: 'volt-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpRadioGroup],
  template: `
    <div
      ngpRadioGroup
      [ngpRadioGroupValue]="value()"
      [ngpRadioGroupDisabled]="disabled()"
      (ngpRadioGroupValueChange)="value.set($event); valueChange.emit($event)"
      [attr.aria-orientation]="orientation()"
      [class.flex-col]="orientation() === 'vertical'"
      [class.flex-row]="orientation() === 'horizontal'"
      class="flex gap-2"
    >
      <ng-content />
    </div>
  `,
})
export class VoltRadioGroup {
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
  readonly value = model<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly valueChange = output<string | null>();
}
