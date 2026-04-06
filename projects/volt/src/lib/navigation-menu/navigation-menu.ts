import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpNavigationMenu, provideNavigationMenuState } from 'ng-primitives/navigation-menu';

@Component({
  selector: 'volt-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuState()],
  host: {
    class: 'relative flex max-w-max flex-1 items-center justify-center',
    role: 'navigation',
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
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly showDelay = input<number>(200);
  readonly hideDelay = input<number>(150);
  readonly value = model<string | null>(null);
}
