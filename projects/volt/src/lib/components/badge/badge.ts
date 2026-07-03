import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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

  protected readonly classes = computed(() => badgeVariants({ variant: this.variant() }));
}
