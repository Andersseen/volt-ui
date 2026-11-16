import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { VoltCheckbox, VoltLabel } from 'volt';

/**
 * The controls set `checked` and `indeterminate`; activating the checkbox changes the preview's own
 * copy and reports it through the two outputs, exactly as a consumer's `[(checked)]` would see it.
 */
@Component({
  selector: 'app-checkbox-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCheckbox, VoltLabel],
  template: `
    <div class="mx-auto flex max-w-xs flex-col items-start gap-3">
      <div class="flex items-center gap-3">
        <volt-checkbox
          id="playground-checkbox"
          [checked]="isChecked()"
          [indeterminate]="isIndeterminate()"
          [disabled]="disabled()"
          (checkedChange)="onChecked($event)"
          (indeterminateChange)="onIndeterminate($event)"
        />
        <volt-label htmlFor="playground-checkbox">Email me about releases</volt-label>
      </div>
      <p class="text-sm text-muted-foreground" aria-live="polite">
        aria-checked: <code class="text-foreground">{{ ariaChecked() }}</code>
      </p>
    </div>
  `,
})
export class CheckboxPlayground {
  readonly checked = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly indeterminate = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly checkedChange = output<boolean>();
  readonly indeterminateChange = output<boolean>();

  protected readonly isChecked = linkedSignal(() => this.checked());
  protected readonly isIndeterminate = linkedSignal(() => this.indeterminate());
  protected readonly ariaChecked = computed(() =>
    this.isIndeterminate() ? 'mixed' : String(this.isChecked())
  );

  protected onChecked(value: boolean): void {
    this.isChecked.set(value);
    this.checkedChange.emit(value);
  }

  protected onIndeterminate(value: boolean): void {
    this.isIndeterminate.set(value);
    this.indeterminateChange.emit(value);
  }
}
