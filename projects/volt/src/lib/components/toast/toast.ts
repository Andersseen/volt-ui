import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpToast } from 'ng-primitives/toast';
import { cva, type VariantProps } from 'class-variance-authority';

export const toastVariants = cva(
  'pointer-events-auto relative flex w-full max-w-sm items-center justify-between gap-4 overflow-hidden rounded-md border p-4 shadow-lg',
  {
    variants: {
      variant: {
        default: 'border-input bg-background text-foreground',
        success: 'border-success/40 bg-success/10 text-foreground',
        error: 'border-error/40 bg-error/10 text-foreground',
        warning: 'border-warning/40 bg-warning/10 text-foreground',
        info: 'border-info/40 bg-info/10 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type ToastVariants = VariantProps<typeof toastVariants>;

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
