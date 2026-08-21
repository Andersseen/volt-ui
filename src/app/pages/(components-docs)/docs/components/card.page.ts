import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { Translations } from '../../../../i18n/translations';

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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly cardCode = CARD_SNIPPET;
  readonly cardUsage = CARD_USAGE;
}
