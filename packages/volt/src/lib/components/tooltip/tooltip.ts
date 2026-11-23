import {
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
  untracked,
} from '@angular/core';
import {
  injectTooltipTriggerState,
  NgpTooltipTrigger,
  provideTooltipConfig,
} from 'ng-primitives/tooltip';
import type { NgpTooltipPlacement } from 'ng-primitives/tooltip';
import type {
  NgpFlip,
  NgpOffset,
  NgpOverlayContent,
  NgpPosition,
  NgpShift,
} from 'ng-primitives/portal';

@Directive({
  selector: '[voltTooltip]',
  host: {
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  // The inputs below only reach the primitive when a consumer binds them; unbound, the primitive
  // falls back to its own config (0ms show, 500ms hide, 4px offset). Providing Volt's documented
  // defaults here is what makes `delay`, `closeDelay`, `offset` and `useTextContent` true.
  providers: [
    provideTooltipConfig({ offset: 8, showDelay: 300, hideDelay: 100, useTextContent: false }),
  ],
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      // `ngpTooltipTrigger` is deliberately NOT aliased to `voltTooltip`: the primitive's input
      // transform turns every string into `null` (ng-primitives 0.131), so `voltTooltip="Save"`
      // reached it as "no content" and nothing ever showed. The content is pushed through the
      // trigger state instead (see the constructor), where strings are rendered as text.
      inputs: [
        'ngpTooltipTriggerPlacement: placement',
        'ngpTooltipTriggerOffset: offset',
        'ngpTooltipTriggerShowDelay: delay',
        'ngpTooltipTriggerHideDelay: closeDelay',
        'ngpTooltipTriggerFlip: flip',
        'ngpTooltipTriggerShift: shift',
        'ngpTooltipTriggerContainer: container',
        'ngpTooltipTriggerShowOnOverflow: showOnOverflow',
        'ngpTooltipTriggerContext: context',
        'ngpTooltipTriggerDisabled: disabled',
        'ngpTooltipTriggerUseTextContent: useTextContent',
        'ngpTooltipTriggerTrackPosition: trackPosition',
        'ngpTooltipTriggerPosition: position',
        'ngpTooltipTriggerScrollBehavior: scrollBehavior',
        'ngpTooltipTriggerCooldown: cooldown',
      ],
    },
  ],
})
export class VoltTooltip {
  readonly voltTooltip = input<NgpOverlayContent<unknown> | string | null>(null);
  readonly placement = input<NgpTooltipPlacement>('top');
  readonly offset = input<NgpOffset>(8);
  readonly delay = input<number>(300);
  readonly closeDelay = input<number>(100);
  readonly flip = input<NgpFlip>(true);
  readonly shift = input<NgpShift>(true);
  readonly container = input<HTMLElement | string | null>(null);
  readonly showOnOverflow = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly context = input<unknown>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly useTextContent = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly trackPosition = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly position = input<NgpPosition | null>(null);
  readonly scrollBehavior = input<'reposition' | 'close'>('reposition');
  readonly cooldown = input(300);

  private readonly triggerState = injectTooltipTriggerState();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  /**
   * The focused element inside the host, when the host itself is not what takes focus: a Volt
   * component that renders its own `<button>` (`volt-toggle`, `volt-switch`). The primitive listens
   * for `focus` on the host only, which never fires there, so keyboard users got no tooltip.
   */
  private readonly focusedDescendant = signal<HTMLElement | null>(null);

  constructor() {
    effect(() => {
      const content = this.voltTooltip();
      untracked(() => this.triggerState().setTooltip(content));
    });

    // The primitive describes the host; a screen reader reads the description of what is focused.
    effect(onCleanup => {
      const target = this.focusedDescendant();
      const id = this.triggerState().overlay()?.ariaDescribedBy();
      if (!target || !id) return;
      const previous = target.getAttribute('aria-describedby');
      const tokens = previous?.split(/\s+/).filter(Boolean) ?? [];
      if (tokens.includes(id)) return;
      this.renderer.setAttribute(target, 'aria-describedby', [...tokens, id].join(' '));
      onCleanup(() => {
        if (previous === null) this.renderer.removeAttribute(target, 'aria-describedby');
        else this.renderer.setAttribute(target, 'aria-describedby', previous);
      });
    });
  }

  protected onFocusIn(event: FocusEvent): void {
    const target = event.target;
    if (target === this.host || !(target instanceof HTMLElement)) return;
    this.focusedDescendant.set(target);
    if (!this.triggerState().disabled()) this.triggerState().show();
  }

  protected onFocusOut(event: FocusEvent): void {
    if (event.target === this.host) return;
    const next = event.relatedTarget;
    if (next instanceof Node && this.host.contains(next)) return;
    this.focusedDescendant.set(null);
    this.triggerState().hide();
  }
}
