import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAvatarFallback } from 'ng-primitives/avatar';

@Component({
  selector: 'volt-avatar-fallback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgpAvatarFallback, inputs: ['ngpAvatarFallbackDelay: delay'] }],
  host: {
    class:
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-foreground',
  },
  template: `<ng-content />`,
})
export class VoltAvatarFallback {}
