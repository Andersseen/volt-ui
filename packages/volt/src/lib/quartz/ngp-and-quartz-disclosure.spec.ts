import { describe } from 'vitest';
import {
  VoltTabs as NgpTabs,
  VoltTabsContent as NgpTabsContent,
  VoltTabsList as NgpTabsList,
  VoltTabsTrigger as NgpTabsTrigger,
} from '../components/tabs';
import {
  VoltAccordion as NgpAccordion,
  VoltAccordionContent as NgpAccordionContent,
  VoltAccordionItem as NgpAccordionItem,
  VoltAccordionTrigger as NgpAccordionTrigger,
} from '../components/accordion';
import {
  VoltTabs as QuartzTabs,
  VoltTabsContent as QuartzTabsContent,
  VoltTabsList as QuartzTabsList,
  VoltTabsTrigger as QuartzTabsTrigger,
} from './tabs';
import {
  VoltAccordion as QuartzAccordion,
  VoltAccordionContent as QuartzAccordionContent,
  VoltAccordionItem as QuartzAccordionItem,
  VoltAccordionTrigger as QuartzAccordionTrigger,
} from './accordion';
import {
  describeAccordionContract,
  describeTabsContract,
} from '../../../testing/disclosure-contract';

describe('headless backends share one Volt Tabs and Accordion contract', () => {
  describeTabsContract('ng-primitives', {
    tabs: NgpTabs,
    list: NgpTabsList,
    trigger: NgpTabsTrigger,
    content: NgpTabsContent,
  });
  describeTabsContract('quartz', {
    tabs: QuartzTabs,
    list: QuartzTabsList,
    trigger: QuartzTabsTrigger,
    content: QuartzTabsContent,
  });
  describeAccordionContract('ng-primitives', {
    accordion: NgpAccordion,
    item: NgpAccordionItem,
    trigger: NgpAccordionTrigger,
    content: NgpAccordionContent,
  });
  describeAccordionContract('quartz', {
    accordion: QuartzAccordion,
    item: QuartzAccordionItem,
    trigger: QuartzAccordionTrigger,
    content: QuartzAccordionContent,
  });
});
