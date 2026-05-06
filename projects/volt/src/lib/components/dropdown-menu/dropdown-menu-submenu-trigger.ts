import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpSubmenuTrigger } from 'ng-primitives/menu';
import type { NgpMenuPlacement } from 'ng-primitives/menu';
import type { NgpOverlayContent } from 'ng-primitives/portal';

@Component({
  selector: 'volt-dropdown-menu-submenu-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSubmenuTrigger],
  template: `
    <button
      type="button"
      [ngpSubmenuTrigger]="submenu()"
      [ngpSubmenuTriggerPlacement]="placement()"
      [ngpSubmenuTriggerOffset]="offset()"
      [ngpSubmenuTriggerDisabled]="disabled()"
      class="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[hover]:bg-accent data-[hover]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <span class="flex-1 text-left"><ng-content /></span>
      <span aria-hidden="true" class="text-muted-foreground">›</span>
    </button>
  `,
})
export class VoltDropdownMenuSubmenuTrigger {
  readonly submenu = input<NgpOverlayContent<unknown> | undefined>(undefined);
  readonly placement = input<NgpMenuPlacement>('right-start');
  readonly offset = input<number>(4);
  readonly disabled = input(false);
}
