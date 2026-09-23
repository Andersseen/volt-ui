import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpAvatar } from 'ng-primitives/avatar';
import { cn } from '../../utils';

@Component({
  selector: 'volt-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpAvatar],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltAvatar {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted', this.class())
  );
}
