import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpComboboxButton } from 'ng-primitives/combobox';
import { cn } from '../../utils';

let nextComboboxButtonId = 0;

@Component({
  selector: 'volt-combobox-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpComboboxButton],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <button
      ngpComboboxButton
      type="button"
      [id]="id()"
      class="inline-flex h-control-md w-control-md shrink-0 cursor-pointer items-center justify-center rounded-md border-(length:--volt-control-border-width) border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      <ng-content />
    </button>
  `,
})
export class VoltComboboxButton {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('contents', this.class()));

  readonly id = input(`volt-combobox-button-${++nextComboboxButtonId}`);
}
