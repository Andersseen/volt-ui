import { ChangeDetectionStrategy, Component, input, model, computed } from '@angular/core';
import { NgpNavigationMenu, provideNavigationMenuState } from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';
import {
  navigationMenuVariants,
  type VoltNavigationMenuLayout,
  type VoltNavigationMenuVariant,
} from './variants';

@Component({
  selector: 'volt-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuState()],
  host: {
    '[class]': 'classes()',
    role: 'navigation',
    '[attr.data-variant]': 'variant()',
    '[attr.data-layout]': 'layout()',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenu,
      inputs: [
        'ngpNavigationMenuOrientation: orientation',
        'ngpNavigationMenuShowDelay: showDelay',
        'ngpNavigationMenuHideDelay: hideDelay',
        'ngpNavigationMenuValue: value',
      ],
      outputs: ['ngpNavigationMenuValueChange: valueChange'],
    },
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenu {
  readonly class = input<string>('');

  /**
   * How the current destination (`active` link) is marked. Links and triggers inside read it, so
   * it is set once per menu. Independent of `layout`.
   */
  readonly variant = input<VoltNavigationMenuVariant>('subtle');

  /** `inline` sits in the application's header; `contained` draws its own self-sized surface. */
  readonly layout = input<VoltNavigationMenuLayout>('inline');

  protected readonly classes = computed(() =>
    cn(navigationMenuVariants({ layout: this.layout(), variant: this.variant() }), this.class())
  );

  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly showDelay = input<number>(200);
  readonly hideDelay = input<number>(150);
  readonly value = model<string | null>(null);
}
