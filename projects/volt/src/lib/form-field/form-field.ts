import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpFormField } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpFormField],
  template: `
    <div ngpFormField class="space-y-[var(--spacing-gap)] w-full block">
      <ng-content />
    </div>
  `,
})
export class VoltFormField {}
