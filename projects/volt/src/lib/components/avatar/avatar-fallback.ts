import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpAvatarFallback } from 'ng-primitives/avatar';

@Component({
  selector: 'volt-avatar-fallback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpAvatarFallback,
      inputs: ['ngpAvatarFallbackDelay: delay'],
    },
  ],
  host: {
    class:
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-foreground',
  },
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full, 9999px);
        background: var(--muted, oklch(0.96 0.004 265));
        color: var(--foreground, oklch(0.14 0.006 265));
        font-weight: var(--font-weight-label, 500);
      }
    `,
  ],
  template: `<ng-content />`,
})
export class VoltAvatarFallback {
  readonly delay = input<number>(0);
}
