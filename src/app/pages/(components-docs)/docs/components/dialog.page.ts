import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltDialog,
  VoltDialogOverlay,
  VoltDialogContent,
  VoltDialogTitle,
  VoltDialogDescription,
  VoltButton,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { DIALOG_SNIPPET } from '../../../../lib/snippets';
import { DIALOG_USAGE } from '../../../../lib/snippets/usage';
import { DIALOG_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-dialog-demo',
  standalone: true,
  imports: [
    VoltDialog,
    VoltDialogOverlay,
    VoltDialogContent,
    VoltDialogTitle,
    VoltDialogDescription,
    VoltButton,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogDemo {
  readonly dialogApi = DIALOG_API;
  readonly dialogUsage = DIALOG_USAGE;
  readonly dialogCode = DIALOG_SNIPPET;
}
