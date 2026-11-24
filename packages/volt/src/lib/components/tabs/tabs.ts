import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgpTabset, provideTabsetState } from 'ng-primitives/tabs';
import { ownRovingFocusGroup, provideOwnRovingFocusGroup } from '../../roving-focus';
import { cn } from '../../utils';

@Component({
  selector: 'volt-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // A tabset never shares its state or its roving group: `inherit: false` on both keeps a tabset
  // nested in another tab panel independent, and keeps composites in a panel out of its tab list.
  providers: [provideTabsetState({ inherit: false }), provideOwnRovingFocusGroup()],
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

  constructor() {
    const tabset = inject(NgpTabset);
    ownRovingFocusGroup({
      orientation: tabset.orientation,
      wrap: tabset.wrap,
      disabled: signal(false),
      homeEnd: signal(true),
    });
  }
}
