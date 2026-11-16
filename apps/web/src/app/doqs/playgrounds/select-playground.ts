import { booleanAttribute, ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { VoltFormField, VoltLabel, VoltSelect, VoltSelectContent, VoltSelectItem } from 'volt';

/** The list is mounted on `<body>`; the playground opts into Doqs's overlay-compatible expanded view. */
@Component({
  selector: 'app-select-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltFormField, VoltLabel, VoltSelect, VoltSelectContent, VoltSelectItem],
  template: `
    <volt-form-field class="mx-auto max-w-xs">
      <volt-label>Plan</volt-label>
      <volt-select
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [required]="required()"
        [(value)]="value"
      >
        <volt-select-content>
          <volt-select-item value="free">Free</volt-select-item>
          <volt-select-item value="team" disabled>Team</volt-select-item>
          <volt-select-item value="pro">Pro</volt-select-item>
          <volt-select-item value="enterprise">Enterprise</volt-select-item>
        </volt-select-content>
      </volt-select>
      <p class="text-sm text-muted-foreground" aria-live="polite">
        Value: <code class="text-foreground">{{ value() ?? '—' }}</code>
      </p>
    </volt-form-field>
  `,
})
export class SelectPlayground {
  readonly placeholder = input('Choose a plan');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly value = model<string | undefined>(undefined);
}
