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
import { ApiReference } from '../../../../components/api-reference';
import { TABLE_SNIPPET } from '../../../../lib/snippets';
import { TABLE_USAGE } from '../../../../lib/snippets/usage';
import { TABLE_API } from '../../../../lib/api-reference.generated';

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
    ApiReference,
  ],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableDemo {
  readonly tableApi = TABLE_API;
  readonly tableCode = TABLE_SNIPPET;
  readonly tableUsage = TABLE_USAGE;
}
