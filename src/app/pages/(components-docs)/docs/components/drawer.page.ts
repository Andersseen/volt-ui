import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltDrawer,
  VoltDrawerContent,
  VoltDrawerTitle,
  VoltDrawerDescription,
  VoltDrawerOverlay,
  VoltDrawerClose,
  VoltButton,
  VoltSwitch,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { IconClose } from '../../../../icons';
import { DRAWER_SNIPPET } from '../../../../lib/snippets';
import { DRAWER_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-drawer-demo',
  standalone: true,
  imports: [
    VoltDrawer,
    VoltDrawerContent,
    VoltDrawerTitle,
    VoltDrawerDescription,
    VoltDrawerOverlay,
    VoltDrawerClose,
    VoltButton,
    VoltSwitch,
    CodePanel,
    IconClose,
  ],
  templateUrl: './drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DrawerDemo {
  readonly drawerCode = DRAWER_SNIPPET;
  readonly drawerUsage = DRAWER_USAGE;
  readonly darkMode = signal(false);
  readonly notifications = signal(false);
}
