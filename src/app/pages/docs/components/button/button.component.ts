import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { BUTTON_SNIPPET } from '../../../../lib/snippets';
import { IconChevronRight, IconMail, IconArrowRight } from '../../../../icons';

@Component({
  selector: 'app-button-demo',
  standalone: true,
  imports: [VoltButton, CodePanel, IconChevronRight, IconMail, IconArrowRight],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonDemo {
  readonly buttonCode = BUTTON_SNIPPET;
}
