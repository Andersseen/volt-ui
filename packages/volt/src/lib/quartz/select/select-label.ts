import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-select-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content></ng-content>`,
})
export class VoltSelectLabel {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('py-1.5 pl-8 pr-2 text-sm font-semibold text-muted-foreground', this.class())
  );
}
