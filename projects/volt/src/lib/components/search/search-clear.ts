import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpSearchClear } from 'ng-primitives/search';

@Component({
  selector: 'volt-search-clear',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpButton, NgpSearchClear],
  template: `
    <button
      ngpButton
      ngpSearchClear
      type="button"
      class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors data-[empty]:hidden data-[hover]:bg-accent data-[hover]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <ng-content />
    </button>
  `,
})
export class VoltSearchClear {}
