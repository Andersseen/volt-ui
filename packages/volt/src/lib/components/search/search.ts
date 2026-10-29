import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpSearch } from 'ng-primitives/search';
import { cn } from '../../utils';

@Component({
  selector: 'volt-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpSearch],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltSearch {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('relative block w-full', this.class()));
}
