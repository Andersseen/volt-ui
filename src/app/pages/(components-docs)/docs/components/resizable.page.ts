import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltResizable, VoltResizablePanel, VoltResizableHandle, VoltSwitch } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { RESIZABLE_SNIPPET } from '../../../../lib/snippets';
import { RESIZABLE_USAGE } from '../../../../lib/snippets/usage';
import { RESIZABLE_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '../../../../i18n/i18n';

@Component({
  selector: 'app-resizable-demo',
  standalone: true,
  imports: [
    VoltResizable,
    VoltResizablePanel,
    VoltResizableHandle,
    VoltSwitch,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './resizable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResizableDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly resizableApi = RESIZABLE_API;
  readonly resizableCode = RESIZABLE_SNIPPET;
  readonly resizableUsage = RESIZABLE_USAGE;
  readonly darkMode = signal(false);
  readonly notifications = signal(false);
}
