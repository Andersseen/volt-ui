import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SelectSeparatorDirective } from '@quartz-headless/primitives';
import { cn } from '../../utils';

/** Hidden from assistive technology (ARIA allows no `separator` inside a `listbox`). */
@Component({
  selector: 'volt-select-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SelectSeparatorDirective],
  host: {
    '[class]': 'classes()',
  },
  template: ``,
})
export class VoltSelectSeparator {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('block -mx-1 my-1 h-px bg-muted', this.class()));
}
