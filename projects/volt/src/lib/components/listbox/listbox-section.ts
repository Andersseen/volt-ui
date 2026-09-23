import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpListboxSection } from 'ng-primitives/listbox';
import { cn } from '../../utils';

@Component({
  selector: 'volt-listbox-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpListboxSection],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltListboxSection {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('grid gap-1', this.class()));
}
