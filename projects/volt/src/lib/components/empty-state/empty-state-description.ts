import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-empty-state-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltEmptyStateDescription {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block text-pretty text-sm text-muted-foreground [&_p]:leading-relaxed', this.class())
  );
}
