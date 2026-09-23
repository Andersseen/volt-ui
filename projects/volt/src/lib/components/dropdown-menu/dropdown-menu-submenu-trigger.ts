import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { NgpMenuItem, NgpSubmenuTrigger } from 'ng-primitives/menu';
import type { NgpMenuPlacement } from 'ng-primitives/menu';
import type { NgpOverlayContent } from 'ng-primitives/portal';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

@Component({
  selector: 'volt-dropdown-menu-submenu-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpMenuItem, NgpSubmenuTrigger],
  template: `
    <button
      type="button"
      role="menuitem"
      ngpMenuItem
      [ngpMenuItemDisabled]="disabled()"
      [ngpSubmenuTrigger]="submenu()"
      [ngpSubmenuTriggerPlacement]="placement()"
      [ngpSubmenuTriggerOffset]="offset()"
      [ngpSubmenuTriggerDisabled]="disabled()"
      [class]="classes()"
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
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Classes for the inner element, merged over the defaults with `cn()`. */
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[hover]:bg-accent data-[hover]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
  }
}
