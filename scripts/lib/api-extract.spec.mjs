// Regression fixtures for the API extractor: each source pattern the library uses, written out in
// a temporary component folder, and the exact API the generators must see for it.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertNoErrors, clearCache, extractComponentDir } from './api-extract.mjs';

let root;
const dir = name => join(root, name);

function component(name, files) {
  mkdirSync(dir(name), { recursive: true });
  for (const [file, content] of Object.entries(files))
    writeFileSync(join(dir(name), file), content);
  return extractComponentDir(dir(name));
}

const byName = list => Object.fromEntries(list.map(entry => [entry.name, entry]));

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'api-extract-'));
  clearCache();
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('signal inputs, models and outputs', () => {
  const source = `
import { Component, booleanAttribute, input, model, numberAttribute, output } from '@angular/core';

@Component({ selector: 'volt-thing', template: '' })
export class VoltThing {
  readonly plain = input();
  readonly typed = input<'a' | 'b'>('a');
  readonly flag = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly count = input(0, { transform: numberAttribute as never });
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly id = input.required<string>();
  readonly page = input.required<number, unknown>({ transform: numberAttribute });
  readonly renamed = input.required<string>({ alias: 'publicName' });
  readonly value = model<string | null>(null);
  readonly open = model.required<boolean>();
  readonly checked = model(false, { alias: 'on' });
  readonly picked = output<string>();
  readonly closed = output();
  readonly aliased = output<number>({ alias: 'changed' });
  readonly lambda = input(1, { transform: (v: unknown) => Number(v) });
  protected readonly internal = 3;
}
`;

  it('reads names, aliases, types, defaults, required and transforms', () => {
    const { directives, diagnostics } = component('thing', { 'thing.ts': source });
    expect(diagnostics.filter(d => d.severity === 'error')).toEqual([]);
    const [thing] = directives;
    expect(thing).toMatchObject({ className: 'VoltThing', selector: 'volt-thing' });
    const inputs = byName(thing.inputs);
    expect(Object.keys(inputs)).toEqual([
      'plain',
      'typed',
      'flag',
      'count',
      'aria-label',
      'id',
      'page',
      'publicName',
      'value',
      'open',
      'on',
      'lambda',
    ]);
    expect(inputs.plain).toMatchObject({ type: 'unknown', required: false, default: undefined });
    expect(inputs.typed).toMatchObject({ type: "'a' | 'b'", default: "'a'" });
    expect(inputs.flag).toMatchObject({
      type: 'boolean',
      default: 'false',
      transform: 'booleanAttribute',
    });
    expect(inputs.count).toMatchObject({
      type: 'number',
      default: '0',
      transform: 'numberAttribute',
    });
    expect(inputs['aria-label']).toMatchObject({
      type: 'string | undefined',
      default: 'undefined',
    });
    expect(inputs.id).toMatchObject({ type: 'string', required: true, default: undefined });
    // input.required takes its options first: they are not a default value.
    expect(inputs.page).toMatchObject({
      required: true,
      default: undefined,
      transform: 'numberAttribute',
    });
    expect(inputs.publicName).toMatchObject({ required: true, type: 'string' });
    expect(inputs.value).toMatchObject({ type: 'string | null', default: 'null', model: true });
    expect(inputs.open).toMatchObject({ type: 'boolean', required: true, model: true });
    expect(inputs.on).toMatchObject({ type: 'boolean', default: 'false', model: true });
    expect(inputs.lambda.transform).toBe('inline');
  });

  it('generates the <model>Change output, honouring the alias', () => {
    const [thing] = component('thing', { 'thing.ts': source }).directives;
    const outputs = byName(thing.outputs);
    expect(Object.keys(outputs)).toEqual([
      'valueChange',
      'openChange',
      'onChange',
      'picked',
      'closed',
      'changed',
    ]);
    expect(outputs.valueChange).toMatchObject({ type: 'string | null', model: true });
    expect(outputs.picked.type).toBe('string');
    expect(outputs.closed.type).toBe('void');
    expect(outputs.changed.type).toBe('number');
  });
});

describe('decorator inputs and outputs', () => {
  it('reads @Input / @Output with aliases and options', () => {
    const { directives } = component('legacy', {
      'legacy.ts': `
import { Directive, EventEmitter, Input, Output } from '@angular/core';
@Directive({ selector: '[voltLegacy]' })
export class VoltLegacy {
  @Input() size: 'sm' | 'md' = 'md';
  @Input('voltLegacy') value = '';
  @Input({ alias: 'label', required: true }) text!: string;
  @Output() pressed = new EventEmitter<MouseEvent>();
  @Output('renamed') other = new EventEmitter<void>();
}`,
    });
    const inputs = byName(directives[0].inputs);
    expect(inputs.size).toMatchObject({
      type: "'sm' | 'md'",
      default: "'md'",
      source: 'decorator',
    });
    expect(inputs.voltLegacy).toMatchObject({ type: 'string', default: "''" });
    expect(inputs.label).toMatchObject({ type: 'string', required: true });
    expect(byName(directives[0].outputs)).toMatchObject({
      pressed: { type: 'MouseEvent' },
      renamed: { type: 'void' },
    });
  });
});

describe('host directives', () => {
  it('resolves aliases and types from a local Volt directive', () => {
    const { directives } = component('wrap', {
      'inner.ts': `
import { Directive, input, output } from '@angular/core';
@Directive({ selector: '[voltInner]' })
export class VoltInner {
  readonly disabled = input<boolean>(false);
  readonly tone = input<'calm' | 'loud'>('calm');
  readonly fired = output<number>();
}`,
      'wrap.ts': `
import { Component } from '@angular/core';
import { VoltInner } from './inner';
@Component({
  selector: 'volt-wrap',
  template: '',
  hostDirectives: [
    VoltInner,
    { directive: VoltInner, inputs: ['disabled', 'tone: mood'], outputs: ['fired: done'] },
  ],
})
export class VoltWrap {}`,
    });
    const wrap = directives.find(d => d.className === 'VoltWrap');
    expect(wrap.inputs).toEqual([
      { name: 'disabled', type: 'boolean', source: 'hostDirective', hostDirective: 'VoltInner' },
      {
        name: 'mood',
        type: "'calm' | 'loud'",
        source: 'hostDirective',
        hostDirective: 'VoltInner',
        alias: 'tone',
      },
    ]);
    expect(wrap.outputs).toEqual([
      {
        name: 'done',
        type: 'number',
        source: 'hostDirective',
        hostDirective: 'VoltInner',
        alias: 'fired',
      },
    ]);
  });

  it('resolves types from a published directive declaration (ng-primitives)', () => {
    const { directives, diagnostics } = component('btn', {
      'btn.ts': `
import { Directive } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
@Directive({ selector: '[voltBtn]', hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }] })
export class VoltBtn {}`,
    });
    expect(diagnostics).toEqual([]);
    expect(directives[0].inputs[0]).toMatchObject({ name: 'disabled', type: 'boolean | "soft"' });
  });

  it('documents an unresolvable host input as unknown, with a diagnostic', () => {
    const { directives, diagnostics } = component('odd', {
      'odd.ts': `
import { Directive } from '@angular/core';
import { Missing } from 'not-a-package/anywhere';
@Directive({ selector: '[voltOdd]', hostDirectives: [{ directive: Missing, inputs: ['x'] }] })
export class VoltOdd {}`,
    });
    expect(directives[0].inputs).toEqual([
      { name: 'x', type: 'unknown', source: 'hostDirective', hostDirective: 'Missing' },
    ]);
    expect(diagnostics).toEqual([
      expect.objectContaining({ severity: 'info', message: expect.stringContaining('Missing.x') }),
    ]);
  });

  it('a non-literal hostDirectives entry is an error, not a silent omission', () => {
    const result = component('dyn', {
      'dyn.ts': `
import { Directive, input } from '@angular/core';
const HOSTS = [];
@Directive({ selector: '[voltDyn]', hostDirectives: HOSTS })
export class VoltDyn { readonly a = input(1); }`,
    });
    expect(result.diagnostics[0]).toMatchObject({ severity: 'error' });
    expect(() => assertNoErrors([result])).toThrow(/hostDirectives is not an array literal/);
  });
});

describe('several classes, inheritance and exports', () => {
  it('extracts every decorated class in a file, in order', () => {
    const { directives } = component('card', {
      'card.ts': `
import { Component, input } from '@angular/core';
@Component({ selector: 'volt-card', template: '' })
export class VoltCard { readonly class = input(''); }
@Component({ selector: 'volt-card-title', template: '' })
export class VoltCardTitle { readonly level = input<1 | 2>(2); }
export class NotDecorated { readonly ignored = 1; }
@Component({ selector: 'volt-card-empty', template: '' })
export class VoltCardEmpty {}`,
    });
    expect(directives.map(d => d.className)).toEqual(['VoltCard', 'VoltCardTitle']);
  });

  it('inherits inputs from a base class in the library', () => {
    const { directives } = component('field', {
      'base.ts': `
import { Directive, input, output } from '@angular/core';
@Directive()
export abstract class FieldBase { readonly disabled = input(false); readonly touched = output<void>(); }`,
      'field.ts': `
import { Component, input } from '@angular/core';
import { FieldBase } from './base';
@Component({ selector: 'volt-field', template: '' })
export class VoltField extends FieldBase { readonly label = input(''); }`,
    });
    const field = directives.find(d => d.className === 'VoltField');
    expect(field.inputs.map(i => i.name)).toEqual(['label', 'disabled']);
    expect(field.outputs.map(o => o.name)).toEqual(['touched']);
  });

  it('an unreachable base class is an error', () => {
    const result = component('ext', {
      'ext.ts': `
import { Component } from '@angular/core';
import { Somewhere } from 'some-lib';
@Component({ selector: 'volt-ext', template: '' })
export class VoltExt extends Somewhere {}`,
    });
    expect(() => assertNoErrors([result])).toThrow(
      /extends Somewhere, which is outside the library/
    );
  });

  it('a call that looks like a signal input but is not one is an error', () => {
    const result = component('wrapped', {
      'wrapped.ts': `
import { Component, input } from '@angular/core';
const inputWithDefault = <T>(v: T) => input(v);
@Component({ selector: 'volt-wrapped', template: '' })
export class VoltWrapped { readonly size = inputWithDefault('md'); }`,
    });
    expect(() => assertNoErrors([result])).toThrow(/not a form the API extractor understands/);
  });

  it('records what the barrel exports, following export *', () => {
    const result = component('menu', {
      'menu.ts': `
import { Component } from '@angular/core';
@Component({ selector: 'volt-menu', template: '' })
export class VoltMenu {}
@Component({ selector: 'volt-menu-internal', template: '' })
export class VoltMenuInternal {}`,
      'types.ts': 'export type MenuSide = "left" | "right";',
      'index.ts': "export { VoltMenu } from './menu';\nexport * from './types';\n",
    });
    expect(result.exports).toEqual(['MenuSide', 'VoltMenu']);
    expect(result.declared.map(d => [d.className, d.exported])).toEqual([
      ['VoltMenu', true],
      ['VoltMenuInternal', false],
    ]);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        severity: 'warning',
        message: expect.stringContaining('VoltMenuInternal'),
      }),
    ]);
  });

  it('a non-literal selector is an error', () => {
    const result = component('sel', {
      'sel.ts': `
import { Component } from '@angular/core';
const S = 'volt-sel';
@Component({ selector: S, template: '' })
export class VoltSel {}`,
    });
    expect(() => assertNoErrors([result])).toThrow(/selector is not a string literal/);
  });
});

describe('CVA variants', () => {
  it('reads every cva() with its options and defaults, booleans included', () => {
    const result = component('nav', {
      'nav.ts': '',
      'variants.ts': `
import { cva } from 'class-variance-authority';
export const navVariants = cva('base hover:bg-muted focus-visible:ring-2', {
  variants: {
    layout: { inline: 'flex', contained: 'grid data-[open]:block' },
    variant: { subtle: 'a', pill: 'b' },
  },
  defaultVariants: { layout: 'inline', variant: 'subtle' },
});
export const itemVariants = cva('item', {
  variants: { inset: { true: 'pl-8', false: '' } },
  defaultVariants: { inset: false },
});`,
    });
    expect(result.variantSets).toEqual([
      {
        name: 'navVariants',
        variants: { layout: ['inline', 'contained'], variant: ['subtle', 'pill'] },
        defaults: { layout: 'inline', variant: 'subtle' },
      },
      {
        name: 'itemVariants',
        variants: { inset: ['true', 'false'] },
        defaults: { inset: 'false' },
      },
    ]);
    // The docs reference shows the first set; Tailwind prefixes inside values are not groups.
    expect(result.variants).toEqual({
      variants: { layout: ['inline', 'contained'], variant: ['subtle', 'pill'] },
      defaults: { layout: 'inline', variant: 'subtle' },
    });
  });
});
