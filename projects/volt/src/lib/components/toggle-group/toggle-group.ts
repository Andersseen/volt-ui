import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpToggleGroup, provideToggleGroupState } from 'ng-primitives/toggle-group';

@Component({
  selector: 'volt-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideToggleGroupState()],
  host: {
    class:
      'inline-flex items-center rounded-[var(--radius-md)] border border-input bg-background p-1 shadow-sm',
  },
  hostDirectives: [
    {
      directive: NgpToggleGroup,
      inputs: [
        'ngpToggleGroupValue: value',
        'ngpToggleGroupType: type',
        'ngpToggleGroupOrientation: orientation',
        'ngpToggleGroupDisabled: disabled',
        'ngpToggleGroupAllowDeselection: allowDeselection',
      ],
      outputs: ['ngpToggleGroupValueChange: valueChange'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltToggleGroup {
  readonly value = model<string[]>([]);
  readonly type = input<'single' | 'multiple'>('single');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = input<boolean>(false);
  readonly allowDeselection = input<boolean>(true);
}
