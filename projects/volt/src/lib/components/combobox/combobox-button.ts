import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpComboboxButton } from 'ng-primitives/combobox';

let nextComboboxButtonId = 0;

@Component({
  selector: 'volt-combobox-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpComboboxButton],
  host: {
    class: 'contents',
  },
  template: `
    <button
      ngpComboboxButton
      [id]="id()"
      class="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      <ng-content />
    </button>
  `,
})
export class VoltComboboxButton {
  readonly id = input(`volt-combobox-button-${++nextComboboxButtonId}`);
}
