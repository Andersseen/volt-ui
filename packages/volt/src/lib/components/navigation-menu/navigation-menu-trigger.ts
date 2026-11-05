import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { NgpNavigationMenuTrigger } from 'ng-primitives/navigation-menu';
import type { NgpOverlayContent } from 'ng-primitives/portal';
import { cn } from '../../utils';

export type NavigationMenuPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

@Component({
  selector: 'volt-navigation-menu-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpNavigationMenuTrigger],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <button
      #button
      type="button"
      class="group/trigger inline-flex h-9 items-center justify-center gap-1 rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[open]:bg-accent/50"
      [ngpNavigationMenuTrigger]="content()"
      [ngpNavigationMenuTriggerPlacement]="placement()"
      [ngpNavigationMenuTriggerOffset]="offset()"
      [ngpNavigationMenuTriggerFlip]="flip()"
      [ngpNavigationMenuTriggerDisabled]="disabled()"
      [ngpNavigationMenuTriggerCooldown]="cooldown()"
    >
      <ng-content />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4 transition-transform duration-200 group-data-[open]/trigger:rotate-180"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  `,
})
export class VoltNavigationMenuTrigger {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('inline-flex', this.class()));

  readonly content = input.required<NgpOverlayContent<unknown>>();
  readonly placement = input<NavigationMenuPlacement>('bottom-start');
  readonly offset = input<number>(4);
  readonly flip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly cooldown = input<number>(300);

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  private panel: HTMLElement | null = null;

  private readonly menuTrigger = viewChild.required(NgpNavigationMenuTrigger);

  constructor() {
    // ng-primitives 0.131: the overlay's own Escape listener (capture phase) removes the panel
    // before the panel's handler runs — the handler that resets the item and restores focus — so
    // focus fell to <body>. This listener is added when the trigger renders, before any overlay
    // exists, so it runs first: it closes through the directive's public hide() and returns focus.
    const document = inject(DOCUMENT);
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !this.panel?.isConnected) return;
      if (!this.panel.contains(event.target as Node)) return;
      event.preventDefault();
      this.menuTrigger().hide();
      this.button().nativeElement.focus();
    };
    afterNextRender(() => document.addEventListener('keydown', onKeydown, true));
    inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', onKeydown, true));
  }

  /** @internal Called by this trigger's `VoltNavigationMenuContent` each time it renders. */
  registerPanel(panel: HTMLElement): void {
    this.panel = panel;
  }
}
