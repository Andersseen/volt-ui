import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltCard,
  VoltCardHeader,
  VoltCardTitle,
  VoltCardDescription,
  VoltCardContent,
  VoltCardFooter,
  VoltFormField,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
} from 'volt';
import { ApiReference } from '../../../../components/api-reference';
import { CodePanel } from '../../../../components/code-panel';
import { CARD_API } from '../../../../lib/api-reference.generated';
import { CARD_SNIPPET } from '../../../../lib/snippets';
import { CARD_USAGE } from '../../../../lib/snippets/usage';
import { injectAppI18n } from '../../../../i18n/i18n';

@Component({
  selector: 'app-card-demo',
  standalone: true,
  imports: [
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
    VoltFormField,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly cardApi = CARD_API;
  readonly cardCode = CARD_SNIPPET;
  readonly cardUsage = CARD_USAGE;
}
