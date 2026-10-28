import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LmnChevronRightIcon, LmnXIcon } from 'lumen-icons';
import {
  VoltButton,
  VoltDrawer,
  VoltDrawerClose,
  VoltDrawerContent,
  VoltDrawerOverlay,
  VoltDrawerTitle,
} from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { DocsNavList, type DocsSidebarGroup } from './docs-nav-list';

/** Below `lg`: a button that opens the docs navigation in a Volt drawer. */
@Component({
  selector: 'app-docs-mobile-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltDrawer,
    VoltDrawerClose,
    VoltDrawerContent,
    VoltDrawerOverlay,
    VoltDrawerTitle,
    LmnChevronRightIcon,
    LmnXIcon,
    DocsNavList,
  ],
  host: { class: 'block' },
  template: `
    <volt-button variant="outline" class="w-full justify-between" [voltDrawer]="drawer">
      {{ browseLabel() }}
      <lmn-chevron-right slot="trailing" [size]="16" />
    </volt-button>

    <ng-template #drawer let-close="close">
      <div voltDrawerOverlay></div>
      <div voltDrawerContent side="left" class="flex w-80 flex-col">
        <div class="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 voltDrawerTitle class="text-sm font-semibold">{{ title() }}</h2>
          <volt-drawer-close [label]="t('ui.docs.closeNav')">
            <lmn-x [size]="16" />
          </volt-drawer-close>
        </div>
        <nav class="flex-1 overflow-y-auto p-4" [attr.aria-label]="title()">
          <app-docs-nav-list [groups]="groups()" (navigated)="close()" />
        </nav>
      </div>
    </ng-template>
  `,
})
export class DocsMobileNav {
  readonly title = input.required<string>();
  readonly browseLabel = input.required<string>();
  readonly groups = input.required<readonly DocsSidebarGroup[]>();

  protected readonly t = injectAppI18n().t;
}
