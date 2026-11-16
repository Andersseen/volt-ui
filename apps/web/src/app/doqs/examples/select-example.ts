import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltFormField,
  VoltLabel,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
} from '@voltui/components';

@Component({
  selector: 'app-select-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltFormField,
    VoltLabel,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSelectLabel,
    VoltSelectSeparator,
  ],
  template: `
    <volt-form-field class="mx-auto max-w-xs">
      <volt-label>Produce</volt-label>
      <volt-select placeholder="Select a fruit" [(value)]="produce" [displayWith]="label">
        <volt-select-content>
          <volt-select-label>Fruits</volt-select-label>
          <volt-select-item value="apple">Apple</volt-select-item>
          <volt-select-item value="banana">Banana</volt-select-item>
          <volt-select-item value="blueberry">Blueberry</volt-select-item>
          <volt-select-separator />
          <volt-select-label>Vegetables</volt-select-label>
          <volt-select-item value="carrot">Carrot</volt-select-item>
          <volt-select-item value="spinach" disabled>Spinach</volt-select-item>
        </volt-select-content>
      </volt-select>
      <p class="text-sm text-muted-foreground">
        Value: <code class="text-foreground">{{ produce() ?? 'none' }}</code>
      </p>
    </volt-form-field>
  `,
})
export class SelectExample {
  readonly produce = signal<string | undefined>(undefined);
  /** The trigger shows the value unless told how to label it. */
  readonly label = (value: unknown) =>
    String(value).charAt(0).toUpperCase() + String(value).slice(1);
}
