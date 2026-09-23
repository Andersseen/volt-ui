import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpPopover } from 'ng-primitives/popover';
import { cn } from '../../utils';

@Component({
  selector: 'volt-popover-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpPopover],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltPopoverContent {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'fixed z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
      this.class()
    )
  );
}
