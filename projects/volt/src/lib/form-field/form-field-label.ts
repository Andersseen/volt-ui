import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpLabel } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpLabel],
  template: `
    <label
      ngpLabel
      [class.text-error]="error()"
      class="text-sm font-[var(--font-weight-label)] text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      <ng-content />
    </label>
  `,
})
export class VoltLabel {
  readonly error = input<boolean>(false);
}
