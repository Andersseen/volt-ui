import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { cn } from '../../utils';

@Component({
  selector: 'volt-resizable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltResizable {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly class = input<string>('');

  protected readonly classes = computed(() => {
    const direction = this.orientation() === 'horizontal' ? 'flex-row' : 'flex-col';
    return cn('flex h-full w-full', direction, this.class());
  });
}
