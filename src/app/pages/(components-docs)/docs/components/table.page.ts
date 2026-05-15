import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltTable,
  VoltTableHeader,
  VoltTableBody,
  VoltTableRow,
  VoltTableHead,
  VoltTableCell,
  VoltTableCaption,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { TABLE_SNIPPET } from '../../../../lib/snippets';
import { TABLE_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-table-demo',
  standalone: true,
  imports: [
    VoltTable,
    VoltTableHeader,
    VoltTableBody,
    VoltTableRow,
    VoltTableHead,
    VoltTableCell,
    VoltTableCaption,
    CodePanel,
  ],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableDemo {
  readonly tableCode = TABLE_SNIPPET;
  readonly tableUsage = TABLE_USAGE;
}
