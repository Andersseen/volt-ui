import { describe } from 'vitest';
import {
  VoltRadioGroup as NgpRadioGroup,
  VoltRadioItem as NgpRadioItem,
} from '../components/radio';
import {
  VoltToggleGroup as NgpToggleGroup,
  VoltToggleGroupItem as NgpToggleGroupItem,
} from '../components/toggle-group';
import { VoltRadioGroup as QuartzRadioGroup, VoltRadioItem as QuartzRadioItem } from './radio';
import {
  VoltToggleGroup as QuartzToggleGroup,
  VoltToggleGroupItem as QuartzToggleGroupItem,
} from './toggle-group';
import {
  describeRadioGroupContract,
  describeToggleGroupContract,
} from '../../../testing/group-contract';

describe('headless backends share one Volt group contract', () => {
  for (const [label, backend] of [
    [
      'ng-primitives',
      { radio: [NgpRadioGroup, NgpRadioItem], toggle: [NgpToggleGroup, NgpToggleGroupItem] },
    ],
    [
      'quartz',
      {
        radio: [QuartzRadioGroup, QuartzRadioItem],
        toggle: [QuartzToggleGroup, QuartzToggleGroupItem],
      },
    ],
  ] as const) {
    describeRadioGroupContract(label, { group: backend.radio[0], item: backend.radio[1] });
    describeToggleGroupContract(label, { group: backend.toggle[0], item: backend.toggle[1] });
  }
});
