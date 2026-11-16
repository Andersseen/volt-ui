import { booleanAttribute, ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { VoltFormField, VoltInput, VoltLabel } from 'volt';

/** The values VoltInput's `size` and `state` accept (see its API reference). */
export const INPUT_SIZES = ['sm', 'md', 'lg'] as const;
export const INPUT_STATES = ['default', 'success', 'error'] as const;

/** Doqs binds the controls to these inputs; `valueChange` is what the event log shows. */
@Component({
  selector: 'app-input-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltFormField, VoltInput, VoltLabel],
  template: `
    <volt-form-field class="mx-auto max-w-xs">
      <volt-label>Email</volt-label>
      <volt-input
        type="email"
        [size]="size()"
        [state]="state()"
        [disabled]="disabled()"
        [required]="required()"
        [placeholder]="placeholder()"
        [(value)]="value"
      />
      <p class="text-sm text-muted-foreground" aria-live="polite">
        Value: <code class="text-foreground">{{ value() || '—' }}</code>
      </p>
    </volt-form-field>
  `,
})
export class InputPlayground {
  readonly size = input<(typeof INPUT_SIZES)[number]>('md');
  readonly state = input<(typeof INPUT_STATES)[number]>('default');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly placeholder = input('you@example.com');
  readonly value = model('');
}
