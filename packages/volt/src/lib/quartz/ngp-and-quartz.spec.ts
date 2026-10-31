import { describe } from 'vitest';
import { VoltCheckbox as NgpCheckbox } from '../components/checkbox';
import { VoltSwitch as NgpSwitch } from '../components/switch';
import { VoltToggle as NgpToggle } from '../components/toggle';
import { VoltCheckbox as QuartzCheckbox } from './checkbox';
import { VoltSwitch as QuartzSwitch } from './switch';
import { VoltToggle as QuartzToggle } from './toggle';
import {
  describeBooleanControlContract,
  describeCheckboxIndeterminateContract,
  type BooleanControlSpec,
} from '../../../testing/headless-contract';

const specs = (
  backend: Record<'checkbox' | 'switch' | 'toggle', BooleanControlSpec['component']>
): BooleanControlSpec[] => [
  {
    component: backend.checkbox,
    tag: 'checkbox',
    role: 'checkbox',
    stateAttr: 'aria-checked',
    model: 'checked',
    onDataAttr: 'data-checked',
  },
  {
    component: backend.switch,
    tag: 'switch',
    role: 'switch',
    stateAttr: 'aria-checked',
    model: 'checked',
    onDataAttr: 'data-checked',
  },
  {
    component: backend.toggle,
    tag: 'toggle',
    role: 'button',
    stateAttr: 'aria-pressed',
    model: 'pressed',
    onDataAttr: 'data-selected',
  },
];

describe('headless backends share one Volt contract', () => {
  for (const [label, backend] of [
    ['ng-primitives', { checkbox: NgpCheckbox, switch: NgpSwitch, toggle: NgpToggle }],
    ['quartz', { checkbox: QuartzCheckbox, switch: QuartzSwitch, toggle: QuartzToggle }],
  ] as const) {
    for (const spec of specs(backend)) describeBooleanControlContract(label, spec);
    describeCheckboxIndeterminateContract(label, backend.checkbox);
  }
});
