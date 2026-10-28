import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpListboxHeader } from 'ng-primitives/listbox';
import { cn } from '../../utils';

@Component({
  selector: 'volt-listbox-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpListboxHeader,
      inputs: ['id'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltListboxHeader {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', this.class())
  );

  readonly id = input<string>();
}
