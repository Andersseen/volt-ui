import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { SELECT_SNIPPET } from '../../../../lib/snippets';
import { SELECT_USAGE } from '../../../../lib/snippets/usage';
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
}
