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
import { DIALOG_SNIPPET } from '../../../../lib/snippets';
import { DIALOG_USAGE } from '../../../../lib/snippets/usage';

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
  ],
  templateUrl: './dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogDemo {
  readonly dialogUsage = DIALOG_USAGE;
  readonly dialogCode = DIALOG_SNIPPET;
}
