import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { NgpMenuItem } from 'ng-primitives/menu';

@Component({
  selector: 'volt-dropdown-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgpMenuItem, inputs: ['ngpMenuItemDisabled: disabled'] }],
  host: {
    role: 'menuitem',
    class:
      'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[hover]:bg-accent data-[hover]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    '(keydown.enter)': 'activate()',
    '(keydown.space)': 'activate(); $event.preventDefault()',
  },
  template: `<ng-content />`,
})
export class VoltDropdownMenuItem {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected activate(): void {
    if (this.disabled()) return;
    this.elementRef.nativeElement.click();
  }
}
