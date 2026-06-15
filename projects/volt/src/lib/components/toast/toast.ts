import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpToast } from 'ng-primitives/toast';

const toastVariantClasses = {
  default: 'border-input bg-background text-foreground',
  success: 'border-success/40 bg-success/10 text-foreground',
  error: 'border-error/40 bg-error/10 text-foreground',
  warning: 'border-warning/40 bg-warning/10 text-foreground',
  info: 'border-info/40 bg-info/10 text-foreground',
} as const;

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
  readonly variant = input<keyof typeof toastVariantClasses>('default');

  protected readonly classes = computed(() =>
    [
      'pointer-events-auto relative flex w-full max-w-sm items-center justify-between gap-4 overflow-hidden rounded-[var(--radius-md)] border p-4 shadow-[var(--shadow-lg)]',
      toastVariantClasses[this.variant()],
    ].join(' ')
  );
}
