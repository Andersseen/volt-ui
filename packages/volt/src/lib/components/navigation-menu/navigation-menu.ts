import { ChangeDetectionStrategy, Component, input, model, computed } from '@angular/core';
import { NgpNavigationMenu, provideNavigationMenuState } from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';

@Component({
  selector: 'volt-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuState()],
  host: {
    '[class]': 'classes()',
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
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('relative flex max-w-max flex-1 items-center justify-center', this.class())
  );

  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly showDelay = input<number>(200);
  readonly hideDelay = input<number>(150);
  readonly value = model<string | null>(null);
}
