import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { TABS_SNIPPET } from '../../../../lib/snippets';

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
  ],
  templateUrl: './tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsDemo {
  readonly tabsCode = TABS_SNIPPET;
}
