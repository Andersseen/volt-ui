import { reflectComponentType, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import {
  VoltListbox as NgpListbox,
  VoltListboxHeader as NgpListboxHeader,
  VoltListboxOption as NgpListboxOption,
  VoltListboxSection as NgpListboxSection,
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
} from './listbox';
import {
  VoltSelect as QuartzSelect,
  VoltSelectContent as QuartzSelectContent,
  VoltSelectItem as QuartzSelectItem,
  VoltSelectLabel as QuartzSelectLabel,
  VoltSelectSeparator as QuartzSelectSeparator,
} from './select';

/*
 * Differential check for Listbox and the closed Select: the same template must produce the same DOM
 * — tags, classes, roles, ARIA and styling hooks — under either engine. Generated ids are replaced
 * by their order of appearance, so references still have to point at the element that carries the
 * id while the numbers are free to differ.
 *
 * Not compared (engine detail, not Volt contract): `data-qz-*`, `ngp*`/`qz*` markers, and the
 * attributes listed in "Known differences" of docs/headless-backends.md. `aria-multiselectable="false"`
 * equals an absent attribute, and a native `<button>` is focusable whatever its `tabindex` says.
 */
const IGNORED =
  /^(data-qz-|ngp[a-z]+$|qz[a-z]+$|data-hover$|data-press$|data-focus-visible$|data-orientation$|aria-disabled$|aria-haspopup$|aria-orientation$|aria-activedescendant$|data-open$|data-placeholder$)/;

interface Node_ {
  tag: string;
  attrs: Record<string, string>;
  classes: string[];
  children: Node_[];
  text: string;
}

const ID_ATTRS = new Set(['id', 'aria-labelledby', 'aria-activedescendant', 'aria-controls']);

function snapshot(el: Element, ids: Map<string, string>): Node_ {
  const idOf = (value: string) => {
    if (!ids.has(value)) ids.set(value, `#${ids.size}`);
    return ids.get(value)!;
  };
  const attrs: Record<string, string> = {};
  for (const a of [...el.attributes].sort((x, y) => x.name.localeCompare(y.name))) {
    if (IGNORED.test(a.name) || a.name === 'class') continue;
    if (a.name === 'aria-multiselectable' && a.value === 'false') continue;
    if (a.name === 'tabindex' && el.tagName === 'BUTTON') continue;
    attrs[a.name] = ID_ATTRS.has(a.name) ? idOf(a.value) : a.value;
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

const LISTBOX = (attrs: string) => `
  <volt-listbox aria-label="Framework" ${attrs}>
    <volt-listbox-section class="extra">
      <volt-listbox-header>Frameworks</volt-listbox-header>
      <volt-listbox-option value="angular">Angular</volt-listbox-option>
      <volt-listbox-option value="react" disabled>React</volt-listbox-option>
    </volt-listbox-section>
    <volt-listbox-option value="vue" [inset]="true" class="mine">Vue</volt-listbox-option>
  </volt-listbox>`;

const SELECT = (attrs: string) => `
  <volt-select placeholder="Pick one" ${attrs}>
    <volt-select-content>
      <volt-select-label>L</volt-select-label>
      <volt-select-item value="a">A</volt-select-item>
      <volt-select-separator />
    </volt-select-content>
  </volt-select>`;

const LISTBOX_CASES = [
  '',
  '[value]="[\'angular\']"',
  'mode="multiple" [value]="[\'angular\', \'vue\']"',
  'disabled [value]="[\'vue\']"',
  'class="gap-8"',
];
const SELECT_CASES = [
  'aria-label="x"',
  'aria-label="x" value="a"',
  'ariaLabel="x" multiple [value]="[\'a\']"',
  'aria-label="x" disabled',
  'aria-label="x" class="w-40"',
];

const listboxImports = (
  box: Type<unknown>,
  header: Type<unknown>,
  option: Type<unknown>,
  section: Type<unknown>
) => [box, header, option, section];
const selectImports = (
  select: Type<unknown>,
  content: Type<unknown>,
  item: Type<unknown>,
  label: Type<unknown>,
  separator: Type<unknown>
) => [select, content, item, label, separator];

describe('Quartz and ng-primitives render the same Volt Listbox and closed Select', () => {
  for (const inputs of LISTBOX_CASES) {
    it(`listbox ${inputs || '(defaults)'}`, async () => {
      const quartz = await capture(
        listboxImports(
          QuartzListbox,
          QuartzListboxHeader,
          QuartzListboxOption,
          QuartzListboxSection
        ),
        LISTBOX(inputs)
      );
      const ngp = await capture(
        listboxImports(NgpListbox, NgpListboxHeader, NgpListboxOption, NgpListboxSection),
        LISTBOX(inputs)
      );
      expect(quartz).toEqual(ngp);
    });
  }
  for (const inputs of SELECT_CASES) {
    it(`select ${inputs}`, async () => {
      const quartz = await capture(
        selectImports(
          QuartzSelect,
          QuartzSelectContent,
          QuartzSelectItem,
          QuartzSelectLabel,
          QuartzSelectSeparator
        ),
        SELECT(inputs)
      );
      const ngp = await capture(
        selectImports(
          NgpSelect,
          NgpSelectContent,
          NgpSelectItem,
          NgpSelectLabel,
          NgpSelectSeparator
        ),
        SELECT(inputs)
      );
      expect(quartz).toEqual(ngp);
    });
  }
});

describe('Quartz and ng-primitives expose the same Listbox and Select public API', () => {
  const surface = (component: Type<unknown>) => {
    const mirror = reflectComponentType(component)!;
    return {
      selector: mirror.selector,
      inputs: mirror.inputs.map(i => `${i.propName}:${i.templateName}:${i.isSignal}`).sort(),
      outputs: mirror.outputs.map(o => `${o.propName}:${o.templateName}`).sort(),
    };
  };
  const PAIRS = {
    listbox: [NgpListbox, QuartzListbox],
    'listbox-option': [NgpListboxOption, QuartzListboxOption],
    'listbox-section': [NgpListboxSection, QuartzListboxSection],
    'listbox-header': [NgpListboxHeader, QuartzListboxHeader],
    'select-content': [NgpSelectContent, QuartzSelectContent],
    'select-item': [NgpSelectItem, QuartzSelectItem],
    'select-label': [NgpSelectLabel, QuartzSelectLabel],
    'select-separator': [NgpSelectSeparator, QuartzSelectSeparator],
  } as const;
  for (const [tag, [ngp, quartz]] of Object.entries(PAIRS)) {
    it(`${tag}: selector, inputs, models and outputs are identical`, () => {
      expect(surface(quartz)).toEqual(surface(ngp));
      expect(surface(quartz).selector).toBe(`volt-${tag}`);
    });
  }

  it('select: identical except the inputs Quartz cannot honour, which are absent rather than ignored', () => {
    const ngp = surface(NgpSelect);
    const quartz = surface(QuartzSelect);
    const names = (s: typeof ngp) => s.inputs.map(i => i.split(':')[0]);
    const missing = names(ngp).filter(n => !names(quartz).includes(n));
    expect(missing.sort()).toEqual(['allOptions', 'container', 'scrollToOption']);
    expect(names(quartz).filter(n => !names(ngp).includes(n))).toEqual([]);
    expect(quartz.outputs).toEqual(ngp.outputs);
  });
});
