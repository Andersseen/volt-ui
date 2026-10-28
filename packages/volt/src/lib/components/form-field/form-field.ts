import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpFormField } from 'ng-primitives/form-field';
import { cn } from '../../utils';

@Component({
  selector: 'volt-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpFormField],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltFormField {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('space-y-2 w-full block', this.class()));
}
