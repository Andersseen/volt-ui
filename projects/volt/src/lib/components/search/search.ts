import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpSearch } from 'ng-primitives/search';

@Component({
  selector: 'volt-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpSearch],
  host: {
    class: 'relative block w-full',
  },
  template: `<ng-content />`,
})
export class VoltSearch {}
