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
  readonly cardCode = CARD_SNIPPET;
  readonly cardUsage = CARD_USAGE;
}
