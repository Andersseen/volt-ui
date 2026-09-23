import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpToolbar, provideToolbarState } from 'ng-primitives/toolbar';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import type { NgpOrientation } from 'ng-primitives/common';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideRovingFocusGroupState(), provideToolbarState()],
  hostDirectives: [
    {
      directive: NgpToolbar,
      inputs: ['ngpToolbarOrientation: orientation'],
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.data-orientation]': 'orientation()',
  },
  template: `<ng-content />`,
})
export class VoltToolbar {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex items-center gap-1 rounded-md border border-input bg-background p-1 shadow-sm data-[orientation=vertical]:flex-col',
      this.class()
    )
  );

  readonly orientation = input<NgpOrientation>('horizontal');
}
