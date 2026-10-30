import { reflectComponentType, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { VoltCheckbox as NgpCheckbox } from '../components/checkbox';
import { VoltSwitch as NgpSwitch } from '../components/switch';
import { VoltToggle as NgpToggle } from '../components/toggle';
import { VoltCheckbox as QuartzCheckbox } from './checkbox';
import { VoltSwitch as QuartzSwitch } from './switch';
import { VoltToggle as QuartzToggle } from './toggle';

/*
 * Differential check: for the same inputs both backends must render the same native control —
 * same attributes, same classes, same inner markup. This is what keeps the theme system
 * independent of the engine: the styling hooks (`data-checked`, `data-selected`, …) and the
 * Tailwind classes are normalised at the Volt boundary.
 *
 * Intentionally not compared (engine detail, not Volt contract):
 *  - `data-qz-*`, and the `ngp*` / `qz*` directive marker attributes — engine-owned.
 *  - `aria-disabled` / native `disabled` — see the Toggle note in headless-contract.ts.
 *  - `data-hover` / `data-press` / `data-focus-visible` — ng-primitives interaction hooks; Volt
 *    styles `:hover`, `:active` and `:focus-visible` instead.
 */
const IGNORED =
  /^(data-qz-|ngp[a-z]+$|qz[a-z]+$|data-hover$|data-press$|data-focus-visible$|aria-disabled$|disabled$)/;

function snapshot(el: Element) {
  const attrs = Object.fromEntries(
    [...el.attributes]
      .filter(a => !IGNORED.test(a.name) && !(a.name === 'id'))
      .map(a => [a.name, a.value])
      .sort(([a], [b]) => String(a).localeCompare(String(b)))
  );
  return {
    attrs,
    classes: [...el.classList].sort(),
    inner: [...el.querySelectorAll('*')].map(c => ({
      tag: c.tagName,
      classes: [...c.classList].sort(),
      attrs: Object.fromEntries(
        [...c.attributes].filter(a => !IGNORED.test(a.name)).map(a => [a.name, a.value])
      ),
    })),
  };
}

async function capture(component: Type<unknown>, template: string) {
  const { container } = await render(template, { imports: [component] });
  const result = snapshot(container.querySelector('button')!);
  TestBed.resetTestingModule();
  return result;
}

const CASES: Record<string, readonly string[]> = {
  checkbox: [
    '',
    '[checked]="true"',
    '[indeterminate]="true"',
    '[checked]="true" [indeterminate]="true"',
    'disabled',
    '[checked]="true" disabled',
    'required',
  ],
  switch: ['', '[checked]="true"', 'disabled', '[checked]="true" disabled'],
  toggle: [
    '',
    '[pressed]="true"',
    'disabled',
    'variant="outline" size="lg"',
    '[pressed]="true" variant="solid" size="icon"',
  ],
};

const BACKENDS = {
  checkbox: [NgpCheckbox, QuartzCheckbox],
  switch: [NgpSwitch, QuartzSwitch],
  toggle: [NgpToggle, QuartzToggle],
} as const;

describe('Quartz and ng-primitives render the same Volt control', () => {
  for (const [tag, [ngp, quartz]] of Object.entries(BACKENDS)) {
    for (const inputs of CASES[tag]) {
      it(`${tag} ${inputs || '(defaults)'}`, async () => {
        const template = `<volt-${tag} aria-label="Subject" ${inputs}>Label</volt-${tag}>`;
        expect(await capture(quartz, template)).toEqual(await capture(ngp, template));
      });
    }
  }
});

describe('Quartz and ng-primitives expose the same public API', () => {
  const surface = (component: Type<unknown>) => {
    const mirror = reflectComponentType(component)!;
    return {
      selector: mirror.selector,
      inputs: mirror.inputs.map(i => `${i.propName}:${i.templateName}:${i.isSignal}`).sort(),
      outputs: mirror.outputs.map(o => `${o.propName}:${o.templateName}`).sort(),
    };
  };
  for (const [tag, [ngp, quartz]] of Object.entries(BACKENDS)) {
    it(`${tag}: selector, inputs, models and outputs are identical`, () => {
      expect(surface(quartz)).toEqual(surface(ngp));
      expect(surface(quartz).selector).toBe(`volt-${tag}`);
    });
  }
});
