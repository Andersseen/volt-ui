import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  VoltDialog,
  VoltDialogOverlay,
  VoltDialogContent,
  VoltDialogTitle,
  VoltDialogDescription,
  VoltDialogRoot,
  VoltDialogService,
  VoltFormField,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
  type VoltDialogContext,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { DIALOG_SNIPPET } from '../../../../lib/snippets';
import { DIALOG_USAGE } from '../../../../lib/snippets/usage';
import { DIALOG_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '../../../../i18n/i18n';

@Component({
  selector: 'app-dialog-demo',
  standalone: true,
  imports: [
    VoltDialog,
    VoltDialogOverlay,
    VoltDialogContent,
    VoltDialogTitle,
    VoltDialogDescription,
    VoltDialogRoot,
    VoltFormField,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
    ReactiveFormsModule,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly dialogApi = DIALOG_API;
  readonly dialogUsage = DIALOG_USAGE;
  readonly dialogCode = DIALOG_SNIPPET;

  private readonly dialog = inject(VoltDialogService);
  private readonly confirmTpl =
    viewChild.required<TemplateRef<VoltDialogContext<boolean>>>('confirmTpl');

  protected readonly editing = signal(false);
  protected readonly projectName = new FormControl('volt-ui', { nonNullable: true });
  protected readonly lastResult = signal('');

  protected onRenamed(result: unknown): void {
    this.lastResult.set(typeof result === 'string' ? `→ ${result}` : '');
  }

  protected async confirmDelete(): Promise<void> {
    const confirmed = await this.dialog.open<boolean>(this.confirmTpl(), { role: 'alertdialog' })
      .closed;
    this.lastResult.set(confirmed ? '✓' : '✗');
  }
}
