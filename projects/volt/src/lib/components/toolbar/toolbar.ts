import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpToolbar, provideToolbarState } from 'ng-primitives/toolbar';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import type { NgpOrientation } from 'ng-primitives/common';

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
    class:
      'inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-input bg-background p-1 shadow-sm data-[orientation=vertical]:flex-col',
    '[attr.data-orientation]': 'orientation()',
  },
  template: `<ng-content />`,
})
export class VoltToolbar {
  readonly orientation = input<NgpOrientation>('horizontal');
}
