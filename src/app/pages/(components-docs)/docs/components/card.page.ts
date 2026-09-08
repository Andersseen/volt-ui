import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltCard,
  VoltCardHeader,
  VoltCardTitle,
  VoltCardDescription,
  VoltCardContent,
  VoltCardFooter,
} from 'volt';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
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
    VoltButton,
    CodePanel,
  ],
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly cardCode = CARD_SNIPPET;
  readonly cardUsage = CARD_USAGE;
}
