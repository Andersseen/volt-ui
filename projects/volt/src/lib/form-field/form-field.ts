import { ChangeDetectionStrategy, Component, viewChild, input } from '@angular/core';
import { NgpFormField } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpFormField],
  host: {
    class: 'space-y-[var(--spacing-gap)] w-full block',
  },
  template: `<ng-content />`,
})
export class VoltFormField {
  // Acts primarily as a wrapper for NgpFormField styling
  // and contextual distribution. Logic handled inside primitive context.
}
