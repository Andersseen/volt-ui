import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  VoltNativeSelect,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { SELECT_SNIPPET } from '../../../../lib/snippets';
import { SELECT_USAGE, NATIVE_SELECT_USAGE } from '../../../../lib/snippets/usage';
import { SELECT_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-select-demo',
  standalone: true,
  imports: [
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSelectLabel,
    VoltSelectSeparator,
    VoltNativeSelect,
    ReactiveFormsModule,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  /*
   * API names, not prose: the same in every language. They live here rather than inline in
   * the template because `<select>` inside an interpolation is a `<` the HTML parser has
   * no reason to leave alone.
   */
  protected readonly nativeNoteSlots = {
    select: 'volt-select',
    element: '<select>',
    formControl: 'formControl',
    ngModel: 'ngModel',
  };

  readonly selectApi = SELECT_API;
  selectedFruit = '';
  readonly selectCode = SELECT_SNIPPET;
  readonly selectUsage = SELECT_USAGE;
  readonly nativeSelectUsage = NATIVE_SELECT_USAGE;
  readonly nativeFruit = new FormControl('apple', { nonNullable: true });
}
