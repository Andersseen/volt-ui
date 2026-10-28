import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpAvatarFallback } from 'ng-primitives/avatar';
import { cn } from '../../utils';

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
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltAvatarFallback {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-foreground',
      this.class()
    )
  );

  readonly delay = input<number>(0);
}
