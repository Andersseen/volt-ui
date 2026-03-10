import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpTabList } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpTabList],
  template: `<ng-content></ng-content>`,
  host: {
    class: 'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
  },
})
export class VoltTabsList {}
