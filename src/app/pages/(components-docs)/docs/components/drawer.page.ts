import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { ApiReference } from '../../../../components/api-reference';
import { LmnXIcon } from 'lumen-icons';
import { DRAWER_SNIPPET } from '../../../../lib/snippets';
import { DRAWER_USAGE } from '../../../../lib/snippets/usage';
import { DRAWER_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

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
    LmnXIcon,
    ApiReference,
  ],
  templateUrl: './drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DrawerDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly drawerApi = DRAWER_API;
  readonly drawerCode = DRAWER_SNIPPET;
  readonly drawerUsage = DRAWER_USAGE;
  readonly darkMode = signal(false);
  readonly notifications = signal(false);
}
