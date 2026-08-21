import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { Translations } from '../../../../i18n/translations';

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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly tableApi = TABLE_API;
  readonly tableCode = TABLE_SNIPPET;
  readonly tableUsage = TABLE_USAGE;
}
