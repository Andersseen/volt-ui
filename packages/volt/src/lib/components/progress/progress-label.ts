import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpProgressLabel } from 'ng-primitives/progress';
import { cn } from '../../utils';

@Component({
  selector: 'volt-progress-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpProgressLabel,
      inputs: ['id'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltProgressLabel {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block text-sm font-medium text-foreground', this.class())
  );
}
