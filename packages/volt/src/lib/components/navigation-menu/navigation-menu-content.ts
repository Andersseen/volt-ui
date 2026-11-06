import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import {
  NgpNavigationMenuContent,
  provideNavigationMenuContentState,
} from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';
import { VoltThemeInherit } from '../theme/theme-scope';
import { VoltNavigationMenuItem } from './navigation-menu-item';

@Component({
  selector: 'volt-navigation-menu-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuContentState()],
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuContent,
      inputs: [
        'ngpNavigationMenuContentOrientation: orientation',
        'ngpNavigationMenuContentWrap: wrap',
      ],
    },
    VoltThemeInherit,
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenuContent {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'fixed z-50 min-w-[8rem] overflow-hidden rounded-lg border-(length:--border-width) border-border bg-popover p-1 shadow-md hidden data-[open]:block',
      this.class()
    )
  );

  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly wrap = input<boolean, unknown>(false, { transform: booleanAttribute });

  constructor() {
    // The panel is declared inside its item (as an <ng-template>), so the item is in the injector
    // even though the panel renders in a body-level overlay. The trigger needs it for Escape.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    inject(VoltNavigationMenuItem, { optional: true })?.trigger()?.registerPanel(host);
  }
}
