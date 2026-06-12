import { booleanAttribute, ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'volt-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpInput],
  host: {
    class: 'block w-full',
    '[attr.id]': 'null',
  },
  template: `
    <input
      ngpInput
      [id]="id()"
      [type]="type()"
      [name]="name()"
      [placeholder]="placeholder()"
      [autocomplete]="autocomplete()"
      [readonly]="readonly()"
      [required]="required()"
      [disabled]="disabled()"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    />
  `,
})
export class VoltInput {
  readonly id = input('');
  readonly type = input('text');
  readonly name = input('');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly value = model('');

  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
}
