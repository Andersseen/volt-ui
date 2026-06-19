import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpFormField } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpFormField],
  host: {
    class: 'space-y-2 w-full block',
  },
  template: `<ng-content />`,
})
export class VoltFormField {}
