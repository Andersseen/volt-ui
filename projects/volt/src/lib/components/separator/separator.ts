import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';
import { cn } from '../../utils';

@Component({
  selector: 'volt-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpSeparator,
      inputs: ['ngpSeparatorOrientation: orientation'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  template: ``,
})
export class VoltSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'block shrink-0 bg-border',
      this.orientation() === 'vertical' ? 'w-px h-full' : 'h-px w-full',
      this.class()
    )
  );
}
