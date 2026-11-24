import { ChangeDetectionStrategy, Component, input, computed, inject } from '@angular/core';
import { NgpToolbar, provideToolbarState } from 'ng-primitives/toolbar';
import type { NgpOrientation } from 'ng-primitives/common';
import {
  ownRovingFocusGroup,
  provideOwnRovingFocusGroup,
  VOLT_ROVING_SCOPE,
  type VoltRovingScope,
} from '../../roving-focus';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideToolbarState(),
    // The toolbar owns its roving group (a toolbar in a tab panel stays out of the tab list), and
    // a toggle group or radio group placed in it joins that group: one tab stop for the toolbar.
    provideOwnRovingFocusGroup(),
    { provide: VOLT_ROVING_SCOPE, useValue: 'shared' satisfies VoltRovingScope },
  ],
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
      'inline-flex items-center gap-1 rounded-md border-(length:--border-width) border-input bg-background p-1 shadow-sm data-[orientation=vertical]:flex-col',
      this.class()
    )
  );

  readonly orientation = input<NgpOrientation>('horizontal');

  constructor() {
    ownRovingFocusGroup({ orientation: inject(NgpToolbar).orientation });
  }
}
