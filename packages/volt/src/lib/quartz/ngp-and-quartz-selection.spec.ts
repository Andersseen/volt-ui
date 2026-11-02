import { describe } from 'vitest';
import {
  VoltListbox as NgpListbox,
  VoltListboxHeader as NgpListboxHeader,
  VoltListboxOption as NgpListboxOption,
  VoltListboxSection as NgpListboxSection,
  VoltListboxTrigger as NgpListboxTrigger,
} from '../components/listbox';
import {
  VoltSelect as NgpSelect,
  VoltSelectContent as NgpSelectContent,
  VoltSelectItem as NgpSelectItem,
  VoltSelectLabel as NgpSelectLabel,
  VoltSelectSeparator as NgpSelectSeparator,
} from '../components/select';
import {
  VoltListbox as QuartzListbox,
  VoltListboxHeader as QuartzListboxHeader,
  VoltListboxOption as QuartzListboxOption,
  VoltListboxSection as QuartzListboxSection,
  VoltListboxTrigger as QuartzListboxTrigger,
} from './listbox';
import {
  VoltSelect as QuartzSelect,
  VoltSelectContent as QuartzSelectContent,
  VoltSelectItem as QuartzSelectItem,
  VoltSelectLabel as QuartzSelectLabel,
  VoltSelectSeparator as QuartzSelectSeparator,
} from './select';
import {
  describeListboxContract,
  describeSelectContract,
} from '../../../testing/selection-contract';

describe('headless backends share one Volt Listbox and Select contract', () => {
  describeListboxContract('ng-primitives', {
    listbox: NgpListbox,
    option: NgpListboxOption,
    section: NgpListboxSection,
    header: NgpListboxHeader,
    trigger: NgpListboxTrigger,
  });
  describeListboxContract('quartz', {
    listbox: QuartzListbox,
    option: QuartzListboxOption,
    section: QuartzListboxSection,
    header: QuartzListboxHeader,
    trigger: QuartzListboxTrigger,
  });
  describeSelectContract('ng-primitives', {
    select: NgpSelect,
    content: NgpSelectContent,
    item: NgpSelectItem,
    label: NgpSelectLabel,
    separator: NgpSelectSeparator,
  });
  describeSelectContract('quartz', {
    select: QuartzSelect,
    content: QuartzSelectContent,
    item: QuartzSelectItem,
    label: QuartzSelectLabel,
    separator: QuartzSelectSeparator,
  });
});
