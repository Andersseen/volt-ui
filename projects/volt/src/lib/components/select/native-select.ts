import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpNativeSelect, provideNativeSelectState } from 'ng-primitives/select';

@Component({
  selector: 'volt-native-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpNativeSelect],
  providers: [provideNativeSelectState()],
  host: {
    class: 'block w-full',
    '[attr.id]': 'null',
  },
  template: `
    <select
      ngpNativeSelect
      [id]="id()"
      [name]="name()"
      [ngpNativeSelectDisabled]="disabled()"
      class="flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ng-content />
    </select>
  `,
})
export class VoltNativeSelect {
  readonly id = input('');
  readonly name = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
}
