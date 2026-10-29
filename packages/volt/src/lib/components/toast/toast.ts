import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpToast } from 'ng-primitives/toast';
import { toastVariants, type ToastVariants } from './variants';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpToast],
  host: {
    '[class]': 'classes()',
    // The toast container is already a polite live region (`role="status"`, ng-primitives >= 0.12x).
    // A second `status` on every toast announced twice, so only an error escalates, to "alert".
    '[attr.role]': 'variant() === "error" ? "alert" : null',
  },
  template: `<ng-content />`,
})
export class VoltToast {
  readonly variant = input<ToastVariants['variant']>('default');

  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(toastVariants({ variant: this.variant() }), this.class())
  );
}
