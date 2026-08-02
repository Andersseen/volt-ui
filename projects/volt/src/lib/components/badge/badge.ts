import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';
import { badgeVariants, type BadgeVariants } from './variants';

@Component({
  selector: 'volt-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltBadge {
  readonly variant = input<BadgeVariants['variant']>('solid');
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(badgeVariants({ variant: this.variant() }), this.class())
  );
}
