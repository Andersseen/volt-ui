import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltToggle } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { TOGGLE_SNIPPET } from '../../../../lib/snippets';
import { TOGGLE_USAGE } from '../../../../lib/snippets/usage';
import { IconItalic, IconBold } from '../../../../icons';

@Component({
  selector: 'app-toggle-demo',
  standalone: true,
  imports: [VoltToggle, CodePanel, IconItalic, IconBold],
  templateUrl: './toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleDemo {
  italic = signal(false);
  bold = signal(true);
  readonly toggleCode = TOGGLE_SNIPPET;
  readonly toggleUsage = TOGGLE_USAGE;
}
