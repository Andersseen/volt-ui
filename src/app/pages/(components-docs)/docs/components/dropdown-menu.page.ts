import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltDropdownMenuTrigger,
  VoltDropdownMenu,
  VoltDropdownMenuItem,
  VoltDropdownMenuSeparator,
  VoltDropdownMenuLabel,
} from 'volt';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { DROPDOWN_MENU_SNIPPET } from '../../../../lib/snippets';
import { DROPDOWN_MENU_USAGE } from '../../../../lib/snippets/usage';
import { DROPDOWN_MENU_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-dropdown-menu-demo',
  standalone: true,
  imports: [
    VoltDropdownMenuTrigger,
    VoltDropdownMenu,
    VoltDropdownMenuItem,
    VoltDropdownMenuSeparator,
    VoltDropdownMenuLabel,
    VoltButton,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './dropdown-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DropdownMenuDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly dropdownMenuApi = DROPDOWN_MENU_API;
  readonly dropdownMenuCode = DROPDOWN_MENU_SNIPPET;
  readonly dropdownMenuUsage = DROPDOWN_MENU_USAGE;
}
