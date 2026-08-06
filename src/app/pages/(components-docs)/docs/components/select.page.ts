import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  readonly selectApi = SELECT_API;
  selectedFruit = '';
  readonly selectCode = SELECT_SNIPPET;
  readonly selectUsage = SELECT_USAGE;
  readonly nativeSelectUsage = NATIVE_SELECT_USAGE;
  readonly nativeFruit = new FormControl('apple', { nonNullable: true });
}
