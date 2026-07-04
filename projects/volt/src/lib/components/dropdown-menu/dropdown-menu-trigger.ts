import { booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';
import { NgpMenuTrigger, provideMenuConfig } from 'ng-primitives/menu';
import type { NgpMenuPlacement } from 'ng-primitives/menu';
import type { NgpFlip, NgpOffset, NgpOverlayContent, NgpShift } from 'ng-primitives/portal';

type VoltMenuTriggerType = 'click' | 'hover' | 'focus' | 'enter' | 'arrowkey';

@Directive({
  selector: '[voltDropdownMenu]',
  providers: [provideMenuConfig({ triggers: ['click', 'enter', 'arrowkey'] })],
  host: {
    '(keydown)': 'focusFirstItemAfterKeyboardOpen($event)',
  },
  hostDirectives: [
    {
      directive: NgpMenuTrigger,
      inputs: [
        'ngpMenuTrigger: voltDropdownMenu',
        'ngpMenuTriggerPlacement: placement',
        'ngpMenuTriggerOffset: offset',
        'ngpMenuTriggerFlip: flip',
        'ngpMenuTriggerShift: shift',
        'ngpMenuTriggerContainer: container',
        'ngpMenuTriggerScrollBehavior: scrollBehavior',
        'ngpMenuTriggerCooldown: cooldown',
        'ngpMenuTriggerContext: context',
        'ngpMenuTriggerOpenTriggers: triggers',
        'ngpMenuTriggerShowDelay: showDelay',
        'ngpMenuTriggerHideDelay: hideDelay',
        'ngpMenuTriggerDisabled: disabled',
      ],
    },
  ],
})
export class VoltDropdownMenuTrigger {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly voltDropdownMenu = input<NgpOverlayContent<unknown> | undefined>(undefined);
  readonly placement = input<NgpMenuPlacement>('bottom-start');
  readonly offset = input<NgpOffset>(4);
  readonly flip = input<NgpFlip>(true);
  readonly shift = input<NgpShift>(true);
  readonly container = input<HTMLElement | string | null>(null);
  readonly scrollBehavior = input<'reposition' | 'block' | 'close'>('reposition');
  readonly cooldown = input(0);
  readonly context = input<unknown>(undefined);
  readonly triggers = input<VoltMenuTriggerType[]>(['click', 'enter', 'arrowkey']);
  readonly showDelay = input(0);
  readonly hideDelay = input(0);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected focusFirstItemAfterKeyboardOpen(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return;

    this.focusFirstVisibleMenuItem();
  }

  private focusFirstVisibleMenuItem(attempt = 0): void {
    setTimeout(() => {
      const document = this.elementRef.nativeElement.ownerDocument;
      const item = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
        element => element.tabIndex === 0 && element.getClientRects().length > 0
      );

      if (item) {
        item.focus();
      } else if (attempt < 5) {
        this.focusFirstVisibleMenuItem(attempt + 1);
      }
    });
  }
}
