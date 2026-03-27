import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpTabList } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpTabList],
  template: `
    <div
      ngpTabList
      class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
    >
      <ng-content />
    </div>
  `,
})
export class VoltTabsList {}
