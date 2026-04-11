import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpMenuItem } from 'ng-primitives/menu';

@Component({
  selector: 'volt-dropdown-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpMenuItem],
  host: { class: 'block w-full' },
  template: `
    <button
      ngpMenuItem
      type="button"
      class="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[hover]:bg-accent data-[hover]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <ng-content />
    </button>
  `,
})
export class VoltDropdownMenuItem {}
