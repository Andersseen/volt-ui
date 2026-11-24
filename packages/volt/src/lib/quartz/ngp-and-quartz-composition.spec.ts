import { describe } from 'vitest';
import {
  VoltTabs as NgpTabs,
  VoltTabsContent as NgpTabsContent,
  VoltTabsList as NgpTabsList,
  VoltTabsTrigger as NgpTabsTrigger,
} from '../components/tabs';
import {
  VoltToggleGroup as NgpToggleGroup,
  VoltToggleGroupItem as NgpToggleGroupItem,
} from '../components/toggle-group';
import {
  VoltRadioGroup as NgpRadioGroup,
  VoltRadioItem as NgpRadioItem,
} from '../components/radio';
import {
  VoltTabs as QuartzTabs,
  VoltTabsContent as QuartzTabsContent,
  VoltTabsList as QuartzTabsList,
  VoltTabsTrigger as QuartzTabsTrigger,
} from './tabs';
import {
  VoltToggleGroup as QuartzToggleGroup,
  VoltToggleGroupItem as QuartzToggleGroupItem,
} from './toggle-group';
import { VoltRadioGroup as QuartzRadioGroup, VoltRadioItem as QuartzRadioItem } from './radio';
import { describeNestedCompositionContract } from '../../../testing/composition-contract';

describe('headless backends share one nested-composition focus contract', () => {
  describeNestedCompositionContract('ng-primitives', {
    tabs: { tabs: NgpTabs, list: NgpTabsList, trigger: NgpTabsTrigger, content: NgpTabsContent },
    toggle: { group: NgpToggleGroup, item: NgpToggleGroupItem },
    radio: { group: NgpRadioGroup, item: NgpRadioItem },
  });
  describeNestedCompositionContract('quartz', {
    tabs: {
      tabs: QuartzTabs,
      list: QuartzTabsList,
      trigger: QuartzTabsTrigger,
      content: QuartzTabsContent,
    },
    toggle: { group: QuartzToggleGroup, item: QuartzToggleGroupItem },
    radio: { group: QuartzRadioGroup, item: QuartzRadioItem },
  });
});
