import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpLabel } from 'ng-primitives/form-field';

@Component({
  selector: 'label[volt-label]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpLabel],
  host: {
    class:
      'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  },
  template: `<ng-content />`,
})
export class VoltLabel {}
