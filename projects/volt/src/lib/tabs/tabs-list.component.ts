import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { NgpTabList, provideTabListState } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [provideTabListState(), provideRovingFocusGroupState()],
  host: {
    class:
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
  },
  hostDirectives: [NgpTabList],
  template: ` <ng-content /> `,
})
export class VoltTabsList {}
