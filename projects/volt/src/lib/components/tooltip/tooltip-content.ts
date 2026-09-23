import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpTooltip } from 'ng-primitives/tooltip';
import { cn } from '../../utils';

@Component({
  selector: 'volt-tooltip-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpTooltip],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTooltipContent {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'fixed z-50 max-w-xs select-none overflow-hidden rounded-sm bg-foreground px-3 py-1.5 text-xs leading-tight font-medium text-background shadow-md',
      this.class()
    )
  );
}
