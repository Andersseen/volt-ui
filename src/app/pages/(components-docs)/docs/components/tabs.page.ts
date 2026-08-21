import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardFooter,
  VoltCardHeader,
  VoltCardTitle,
  VoltInput,
  VoltLabel,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TABS_SNIPPET } from '../../../../lib/snippets';
import { TABS_USAGE } from '../../../../lib/snippets/usage';
import { TABS_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-tabs-demo',
  standalone: true,
  imports: [
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltButton,
    VoltInput,
    VoltLabel,
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly tabsApi = TABS_API;
  readonly tabsCode = TABS_SNIPPET;
  readonly tabsUsage = TABS_USAGE;
}
