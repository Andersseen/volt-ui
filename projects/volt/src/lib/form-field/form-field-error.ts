import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpError } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpError],
  template: `
    <span ngpError role="alert" aria-live="assertive" class="text-[var(--error)] text-sm font-medium">
      <ng-content />
    </span>
  `,
})
export class VoltError {}
