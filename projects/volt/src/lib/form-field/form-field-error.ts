import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpError } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpError],
  host: {
    role: 'alert',
    'aria-live': 'polite',
    class: 'text-[var(--error)] text-sm font-medium',
  },
  template: `<ng-content />`,
})
export class VoltError {}
