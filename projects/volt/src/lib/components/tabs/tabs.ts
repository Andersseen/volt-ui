import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  computed,
} from '@angular/core';
import { NgpTabset, provideTabsetState } from 'ng-primitives/tabs';
import { cn } from '../../utils';

@Component({
  selector: 'volt-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabsetState()],
  host: {
    '[class]': 'classes()',
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
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('w-full block', this.class()));

  readonly value = model<string | undefined>(undefined);
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly activateOnFocus = input<boolean, unknown>(true, { transform: booleanAttribute });
}
