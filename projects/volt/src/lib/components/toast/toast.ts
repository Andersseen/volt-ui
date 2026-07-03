import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpToast } from 'ng-primitives/toast';
import { toastVariants, type ToastVariants } from './variants';

@Component({
  selector: 'volt-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpToast],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltToast {
  readonly variant = input<ToastVariants['variant']>('default');

  protected readonly classes = computed(() => toastVariants({ variant: this.variant() }));
}
