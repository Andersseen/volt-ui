import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VoltToggle } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TOGGLE_SNIPPET } from '../../../../lib/snippets';
import { TOGGLE_USAGE } from '../../../../lib/snippets/usage';
import { TOGGLE_API } from '../../../../lib/api-reference.generated';
import { LmnBoldIcon, LmnItalicIcon } from 'lumen-icons';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-toggle-demo',
  standalone: true,
  imports: [VoltToggle, CodePanel, LmnItalicIcon, LmnBoldIcon, ApiReference],
  templateUrl: './toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly toggleApi = TOGGLE_API;
  italic = signal(false);
  bold = signal(true);
  readonly toggleCode = TOGGLE_SNIPPET;
  readonly toggleUsage = TOGGLE_USAGE;
}
