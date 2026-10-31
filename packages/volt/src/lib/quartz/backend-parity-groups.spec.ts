import { reflectComponentType, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
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

/*
 * Differential check for the group controls: the same template must produce the same DOM — tags,
 * classes, roles, ARIA and styling hooks — under either engine. Generated ids are replaced by their
 * order of appearance, so `aria-labelledby` still has to point at the element that carries the
 * label, while the numbers themselves are free to differ.
 *
 * Not compared (engine detail, not Volt contract): `data-qz-*`, `ngp*`/`qz*` markers,
 * `data-orientation`/`data-type` (ng-primitives), `data-hover|press|focus-visible`, and
 * `aria-disabled` / native `disabled` (see "Known differences" in docs/headless-backends.md).
 */
const IGNORED =
  /^(data-qz-|ngp[a-z]+$|qz[a-z]+$|data-hover$|data-press$|data-focus-visible$|data-orientation$|data-type$|aria-disabled$|disabled$)/;

interface Node_ {
  tag: string;
  attrs: Record<string, string>;
  classes: string[];
  children: Node_[];
  text: string;
}

function snapshot(el: Element, ids: Map<string, string>): Node_ {
  const idOf = (value: string) => {
    if (!ids.has(value)) ids.set(value, `#${ids.size}`);
    return ids.get(value)!;
  };
  const attrs: Record<string, string> = {};
  for (const a of [...el.attributes].sort((x, y) => x.name.localeCompare(y.name))) {
    if (IGNORED.test(a.name) || a.name === 'class') continue;
    attrs[a.name] = a.name === 'id' || a.name === 'aria-labelledby' ? idOf(a.value) : a.value;
  }
  return {
    tag: el.tagName,
    attrs,
    classes: [...el.classList].sort(),
    children: [...el.children].map(c => snapshot(c, ids)),
    text: [...el.childNodes]
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent?.trim() ?? '')
      .join(''),
  };
}

async function capture(imports: Type<unknown>[], template: string) {
  const { container } = await render(template, { imports });
  const result = [...container.children].map(c => snapshot(c, new Map()));
  TestBed.resetTestingModule();
  return result;
}

const RADIO = (attrs: string) => `
  <volt-radio-group aria-label="Fruit" ${attrs}>
    <volt-radio-item value="apple">Apple</volt-radio-item>
    <volt-radio-item value="pear" disabled>Pear</volt-radio-item>
    <volt-radio-item value="plum" aria-label="Plum" class="extra"></volt-radio-item>
  </volt-radio-group>`;

const TOGGLE = (attrs: string) => `
  <volt-toggle-group aria-label="Format" ${attrs}>
    <volt-toggle-group-item value="bold" variant="outline" size="lg">Bold</volt-toggle-group-item>
    <volt-toggle-group-item value="italic" disabled>Italic</volt-toggle-group-item>
    <volt-toggle-group-item value="underline" aria-label="Underline" class="extra">U</volt-toggle-group-item>
  </volt-toggle-group>`;

const RADIO_CASES = [
  '',
  'value="apple"',
  'value="plum" orientation="horizontal"',
  'disabled value="apple"',
  'class="gap-8"',
];
const TOGGLE_CASES = [
  '',
  '[value]="[\'bold\']"',
  '[value]="[\'bold\', \'underline\']" type="multiple"',
  'type="multiple"',
  'disabled [value]="[\'bold\']"',
  'orientation="vertical" [allowDeselection]="false"',
];

describe('Quartz and ng-primitives render the same Volt group controls', () => {
  for (const inputs of RADIO_CASES) {
    it(`radio group ${inputs || '(defaults)'}`, async () => {
      const quartz = await capture([QuartzRadioGroup, QuartzRadioItem], RADIO(inputs));
      const ngp = await capture([NgpRadioGroup, NgpRadioItem], RADIO(inputs));
      expect(quartz).toEqual(ngp);
    });
  }
  for (const inputs of TOGGLE_CASES) {
    it(`toggle group ${inputs || '(defaults)'}`, async () => {
      const quartz = await capture([QuartzToggleGroup, QuartzToggleGroupItem], TOGGLE(inputs));
      const ngp = await capture([NgpToggleGroup, NgpToggleGroupItem], TOGGLE(inputs));
      expect(quartz).toEqual(ngp);
    });
  }
});

describe('Quartz and ng-primitives expose the same group public API', () => {
  const surface = (component: Type<unknown>) => {
    const mirror = reflectComponentType(component)!;
    return {
      selector: mirror.selector,
      inputs: mirror.inputs.map(i => `${i.propName}:${i.templateName}:${i.isSignal}`).sort(),
      outputs: mirror.outputs.map(o => `${o.propName}:${o.templateName}`).sort(),
    };
  };
  const PAIRS = {
    'radio-group': [NgpRadioGroup, QuartzRadioGroup],
    'radio-item': [NgpRadioItem, QuartzRadioItem],
    'toggle-group': [NgpToggleGroup, QuartzToggleGroup],
    'toggle-group-item': [NgpToggleGroupItem, QuartzToggleGroupItem],
  } as const;
  for (const [tag, [ngp, quartz]] of Object.entries(PAIRS)) {
    it(`${tag}: selector, inputs, models and outputs are identical`, () => {
      expect(surface(quartz)).toEqual(surface(ngp));
      expect(surface(quartz).selector).toBe(`volt-${tag}`);
    });
  }
});
