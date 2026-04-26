import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpToast } from 'ng-primitives/toast';

@Component({
  selector: 'volt-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpToast],
  host: {
    class:
      'pointer-events-auto relative flex w-full max-w-sm items-center justify-between gap-4 overflow-hidden rounded-[var(--radius-md)] border border-input bg-background p-4 shadow-[var(--shadow-lg)]',
  },
  template: `<ng-content />`,
})
export class VoltToast {
  readonly variant = input<'default' | 'success' | 'error' | 'warning' | 'info'>('default');
}
