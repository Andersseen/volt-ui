import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { skeletonVariants, type SkeletonVariants } from './variants';

@Component({
  selector: 'volt-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
  template: ``,
})
export class VoltSkeleton {
  readonly variant = input<SkeletonVariants['variant']>('rectangle');
  readonly class = input<string>('');
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');

  protected readonly classes = computed(
    () => skeletonVariants({ variant: this.variant() }) + ' ' + this.class()
  );
}
