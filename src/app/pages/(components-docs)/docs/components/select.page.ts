import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { SELECT_SNIPPET } from '../../../../lib/snippets';
import { SELECT_USAGE } from '../../../../lib/snippets/usage';

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
  ],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectDemo {
  selectedFruit = '';
  readonly selectCode = SELECT_SNIPPET;
  readonly selectUsage = SELECT_USAGE;
}
