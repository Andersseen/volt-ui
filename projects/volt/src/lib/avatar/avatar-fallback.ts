import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'volt-avatar-fallback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-foreground',
  },
  template: `<ng-content />`,
})
export class VoltAvatarFallback {
  readonly delay = input<number>(0);
}
