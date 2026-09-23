import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpProgressValue } from 'ng-primitives/progress';
import { cn } from '../../utils';

@Component({
  selector: 'volt-progress-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpProgressValue],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltProgressValue {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block text-sm text-muted-foreground', this.class())
  );
}
