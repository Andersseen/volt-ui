import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAvatar } from 'ng-primitives/avatar';

@Component({
  selector: 'volt-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpAvatar],
  host: {
    class: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted',
  },
  styles: [
    `
      :host {
        position: relative;
        display: flex;
        height: 2.5rem;
        width: 2.5rem;
        flex-shrink: 0;
        overflow: hidden;
        border-radius: var(--radius-full, 9999px);
        background: var(--muted, oklch(0.96 0.004 265));
      }
    `,
  ],
  template: `<ng-content />`,
})
export class VoltAvatar {}
