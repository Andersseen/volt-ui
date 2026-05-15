import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

export const skeletonVariants = cva('animate-pulse bg-muted', {
  variants: {
    variant: {
      circle: 'rounded-full',
      rectangle: 'rounded-[var(--radius-md)]',
      text: 'rounded-[var(--radius-md)]',
    },
  },
  defaultVariants: {
    variant: 'rectangle',
  },
});

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;

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
