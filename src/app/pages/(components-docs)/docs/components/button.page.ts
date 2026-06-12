import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { BUTTON_SNIPPET } from '../../../../lib/snippets';
import { BUTTON_USAGE } from '../../../../lib/snippets/usage';
import { LmnArrowRightIcon, LmnChevronRightIcon, LmnMailIcon } from 'lumen-icons';

@Component({
  selector: 'app-button-demo',
  standalone: true,
  imports: [VoltButton, CodePanel, LmnChevronRightIcon, LmnMailIcon, LmnArrowRightIcon],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonDemo {
  readonly buttonCode = BUTTON_SNIPPET;
  readonly buttonUsage = BUTTON_USAGE;
}
