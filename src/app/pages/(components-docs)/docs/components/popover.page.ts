import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltPopoverTrigger, VoltPopoverContent } from 'volt';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { POPOVER_SNIPPET } from '../../../../lib/snippets';
import { POPOVER_USAGE } from '../../../../lib/snippets/usage';
import { POPOVER_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '../../../../i18n/i18n';

@Component({
  selector: 'app-popover-demo',
  standalone: true,
  imports: [VoltPopoverTrigger, VoltPopoverContent, VoltButton, CodePanel, ApiReference],
  templateUrl: './popover.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly popoverApi = POPOVER_API;
  readonly popoverCode = POPOVER_SNIPPET;
  readonly popoverUsage = POPOVER_USAGE;
}
