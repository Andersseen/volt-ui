import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltLabel, VoltNativeSelect } from '@voltui/components';

/** The real `<select>`: the platform's own picker, keyboard and form behavior. */
@Component({
  selector: 'app-native-select-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, VoltLabel, VoltNativeSelect],
  template: `
    <div class="mx-auto max-w-xs space-y-3">
      <volt-label htmlFor="fruit">Fruit</volt-label>
      <select id="fruit" voltNativeSelect [formControl]="fruit">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
        <option value="blueberry">Blueberry</option>
      </select>
      <p class="text-sm text-muted-foreground">
        Value: <code class="text-foreground">{{ fruit.value }}</code>
      </p>
    </div>
  `,
})
export class NativeSelectExample {
  readonly fruit = new FormControl('apple', { nonNullable: true });
}
