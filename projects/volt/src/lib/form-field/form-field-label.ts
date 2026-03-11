import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpLabel } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-label',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpLabel],
  host: {
    class:
      'text-sm font-[var(--font-weight-label)] text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    '[class.text-error]': 'error()',
  },
  template: `<ng-content />`,
})
export class VoltLabel {
  readonly error = input<boolean>(false);
}
