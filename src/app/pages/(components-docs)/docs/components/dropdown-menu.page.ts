import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltDropdownMenuTrigger,
  VoltDropdownMenu,
  VoltDropdownMenuItem,
  VoltDropdownMenuSeparator,
  VoltDropdownMenuLabel,
} from 'volt';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { DROPDOWN_MENU_SNIPPET } from '../../../../lib/snippets';
import { DROPDOWN_MENU_USAGE } from '../../../../lib/snippets/usage';

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
  ],
  templateUrl: './dropdown-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DropdownMenuDemo {
  readonly dropdownMenuCode = DROPDOWN_MENU_SNIPPET;
  readonly dropdownMenuUsage = DROPDOWN_MENU_USAGE;
}
