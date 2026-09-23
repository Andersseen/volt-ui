import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VoltButton, VoltNativeButton, VoltSpinner } from 'volt';
import { ApiReference } from '../../../../components/api-reference';
import { CodePanel } from '../../../../components/code-panel';
import { BUTTON_API } from '../../../../lib/api-reference.generated';
import { BUTTON_SNIPPET } from '../../../../lib/snippets';
import { BUTTON_USAGE } from '../../../../lib/snippets/usage';
import { LmnArrowRightIcon, LmnChevronRightIcon, LmnMailIcon } from 'lumen-icons';
import { injectAppI18n } from '../../../../i18n/i18n';

@Component({
  selector: 'app-button-demo',
  standalone: true,
  imports: [
    RouterLink,
    VoltButton,
    VoltNativeButton,
    VoltSpinner,
    CodePanel,
    ApiReference,
    LmnChevronRightIcon,
    LmnMailIcon,
    LmnArrowRightIcon,
  ],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly buttonCode = BUTTON_SNIPPET;
  readonly buttonUsage = BUTTON_USAGE;
  readonly buttonApi = BUTTON_API;

  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }
}
