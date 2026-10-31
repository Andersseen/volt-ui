import { Component, signal, Type } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

/*
 * The observable Volt contract of the group controls — RadioGroup and ToggleGroup — written once
 * and run against every headless backend (see `headless-contract.ts` for the boolean controls).
 * It asserts what a consumer can observe: roles, ARIA, focus, keyboard, emitted values, Forms
 * state. Never which primitive produced it.
 */

export interface RadioGroupSpec {
  readonly group: Type<unknown>;
  readonly item: Type<unknown>;
}

export interface ToggleGroupSpec {
  readonly group: Type<unknown>;
  readonly item: Type<unknown>;
}

const radios = (name?: string) => screen.getAllByRole('radio', name ? { name } : undefined);

export function describeRadioGroupContract(label: string, spec: RadioGroupSpec): void {
  const imports = [spec.group, spec.item];
  const fruit = (attrs = '', items = '') => `
    <volt-radio-group aria-label="Fruit" ${attrs}>
      <volt-radio-item value="apple">Apple</volt-radio-item>
      <volt-radio-item value="pear">Pear</volt-radio-item>
      <volt-radio-item value="plum">Plum</volt-radio-item>${items}
    </volt-radio-group>`;

  describe(`${label} radio group — Volt contract`, () => {
    it('exposes a radiogroup of native buttons named by their label, none checked by default', async () => {
      await render(fruit(), { imports });
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(radios()).toHaveLength(3);
      for (const radio of radios()) {
        expect(radio.tagName).toBe('BUTTON');
        expect(radio).toHaveAttribute('type', 'button');
        expect(radio).toHaveAttribute('aria-checked', 'false');
        expect(radio).not.toHaveAttribute('data-checked');
      }
      expect(radios('Pear')).toHaveLength(1);
    });

    it('has unique ids and no dangling aria-labelledby reference', async () => {
      const { container } = await render(fruit(), { imports });
      const ids = [...container.querySelectorAll('[id]')].map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const radio of radios()) {
        const target = radio.getAttribute('aria-labelledby');
        expect(target).toBeTruthy();
        expect(container.querySelector(`[id="${target}"]`)).not.toBeNull();
      }
    });

    it('puts a supplied id on the button, so an external <label for> names it', async () => {
      const { container } = await render(
        `<label for="mine">Citrus</label>
         <volt-radio-group><volt-radio-item value="a" id="mine"></volt-radio-item></volt-radio-group>`,
        { imports }
      );
      const radio = container.querySelector('#mine') as HTMLElement;
      expect(container.querySelectorAll('#mine')).toHaveLength(1);
      expect(radio.tagName).toBe('BUTTON');
      expect(radio).toHaveAttribute('role', 'radio');
      expect(container.querySelector('volt-radio-item')).not.toHaveAttribute('id');
      expect(screen.getByLabelText('Citrus')).toBe(radio);
    });

    it('treats a static value as the initial selection', async () => {
      await render(fruit('value="pear"'), { imports });
      expect(radios('Pear')[0]).toHaveAttribute('aria-checked', 'true');
      expect(radios('Pear')[0]).toHaveAttribute('data-checked');
      expect(radios('Apple')[0]).toHaveAttribute('aria-checked', 'false');
    });

    it('selects on click, emits once per change, and stays quiet when re-selecting', async () => {
      const spy = vi.fn();
      await render(fruit('(valueChange)="spy($event)"'), {
        imports,
        componentProperties: { spy },
      });
      const user = userEvent.setup();
      await user.click(radios('Apple')[0]);
      expect(radios('Apple')[0]).toHaveAttribute('aria-checked', 'true');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('apple');
      await user.click(radios('Apple')[0]);
      expect(spy).toHaveBeenCalledTimes(1);
      await user.click(radios('Plum')[0]);
      expect(radios('Apple')[0]).toHaveAttribute('aria-checked', 'false');
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith('plum');
    });

    it('keeps a two-way binding in step and does not emit for programmatic changes', async () => {
      const spy = vi.fn();
      const value = signal<string | null>('apple');
      const { fixture } = await render(fruit('[value]="value()" (valueChange)="spy($event)"'), {
        imports,
        componentProperties: { value, spy },
      });
      expect(radios('Apple')[0]).toHaveAttribute('aria-checked', 'true');
      value.set('plum');
      await fixture.whenStable();
      expect(radios('Plum')[0]).toHaveAttribute('aria-checked', 'true');
      expect(radios('Apple')[0]).toHaveAttribute('aria-checked', 'false');
      value.set(null);
      await fixture.whenStable();
      expect(radios().every(r => r.getAttribute('aria-checked') === 'false')).toBe(true);
      expect(spy).not.toHaveBeenCalled();
    });

    it('writes user selections back through [(value)]', async () => {
      const value = signal<string | null>(null);
      await render(fruit('[(value)]="value"'), { imports, componentProperties: { value } });
      await userEvent.setup().click(radios('Pear')[0]);
      expect(value()).toBe('pear');
    });

    it('honours compareWith', async () => {
      const compareWith = (a: string | null, b: string | null) =>
        (a ?? '').toLowerCase() === (b ?? '').toLowerCase();
      await render(fruit('value="PEAR" [compareWith]="compareWith"'), {
        imports,
        componentProperties: { compareWith },
      });
      expect(radios('Pear')[0]).toHaveAttribute('aria-checked', 'true');
    });

    it('ignores a disabled item and a disabled group', async () => {
      const spy = vi.fn();
      await render(
        `<volt-radio-group aria-label="x" (valueChange)="spy($event)">
           <volt-radio-item value="a" disabled>A</volt-radio-item>
           <volt-radio-item value="b">B</volt-radio-item>
         </volt-radio-group>
         <volt-radio-group aria-label="y" disabled (valueChange)="spy($event)">
           <volt-radio-item value="c">C</volt-radio-item>
         </volt-radio-group>`,
        { imports, componentProperties: { spy } }
      );
      const user = userEvent.setup();
      await user.click(radios('A')[0]);
      await user.click(radios('C')[0]);
      expect(spy).not.toHaveBeenCalled();
      expect(radios('A')[0]).toHaveAttribute('data-disabled');
      expect(radios('C')[0]).toHaveAttribute('data-disabled');
      await user.click(radios('B')[0]);
      expect(spy).toHaveBeenCalledWith('b');
    });

    it('is one tab stop (the checked item) and leaves the group on the next Tab', async () => {
      await render(`${fruit('value="pear"')}<button>after</button>`, { imports });
      const user = userEvent.setup();
      await user.tab();
      expect(radios('Pear')[0]).toHaveFocus();
      expect(radios('Apple')[0]).toHaveAttribute('tabindex', '-1');
      await user.tab();
      expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
    });

    it('enters on the first item when nothing is checked', async () => {
      await render(fruit(), { imports });
      await userEvent.setup().tab();
      expect(radios('Apple')[0]).toHaveFocus();
    });

    it('moves and selects with the arrow keys of its orientation, wrapping at the ends', async () => {
      const spy = vi.fn();
      await render(fruit('value="apple" (valueChange)="spy($event)"'), {
        imports,
        componentProperties: { spy },
      });
      const user = userEvent.setup();
      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(radios('Pear')[0]).toHaveFocus();
      expect(radios('Pear')[0]).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(radios('Apple')[0]).toHaveFocus();
      expect(radios('Apple')[0]).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{ArrowUp}');
      expect(radios('Plum')[0]).toHaveFocus();
      expect(spy).toHaveBeenCalledTimes(4);
    });

    it('answers Left/Right in a horizontal group', async () => {
      await render(fruit('orientation="horizontal" value="apple"'), { imports });
      const user = userEvent.setup();
      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(radios('Pear')[0]).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(radios('Apple')[0]).toHaveFocus();
    });

    it('selects the focused item with Space', async () => {
      const spy = vi.fn();
      await render(fruit('(valueChange)="spy($event)"'), { imports, componentProperties: { spy } });
      const user = userEvent.setup();
      await user.tab();
      await user.keyboard(' ');
      expect(radios('Apple')[0]).toHaveAttribute('aria-checked', 'true');
      expect(spy).toHaveBeenCalledExactlyOnceWith('apple');
    });

    it('reports its orientation', async () => {
      await render(fruit('orientation="horizontal"'), { imports });
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('survives removing the checked item without moving the tab stop off the group', async () => {
      const show = signal(true);
      const late = signal(false);
      const { fixture } = await render(
        `<volt-radio-group aria-label="x" value="b">
           <volt-radio-item value="a">A</volt-radio-item>
           @if (show()) { <volt-radio-item value="b">B</volt-radio-item> }
           @if (late()) { <volt-radio-item value="z">Z</volt-radio-item> }
         </volt-radio-group>`,
        { imports, componentProperties: { show, late } }
      );
      expect(radios('B')[0]).toHaveAttribute('aria-checked', 'true');
      show.set(false);
      await fixture.whenStable();
      expect(radios()).toHaveLength(1);
      await userEvent.setup().tab();
      expect(radios('A')[0]).toHaveFocus();
      show.set(true);
      await fixture.whenStable();
      expect(radios()).toHaveLength(2);
    });

    describe('with Angular Forms', () => {
      @Component({
        selector: 'app-contract-radio-reactive',
        imports: [...(imports as never[]), ReactiveFormsModule],
        template: `
          <volt-radio-group aria-label="Fruit" [formControl]="control">
            <volt-radio-item value="apple">Apple</volt-radio-item>
            <volt-radio-item value="pear">Pear</volt-radio-item>
          </volt-radio-group>
          <button type="button">after</button>
        `,
      })
      class Reactive {
        readonly control = new FormControl<string | null>(null, Validators.required);
      }

      it('writes silently, emits one change per user selection, tracks dirty/touched, resets, disables', async () => {
        const { fixture } = await render(Reactive);
        const control = fixture.componentInstance.control;
        const changes = vi.fn();
        control.valueChanges.subscribe(changes);

        control.setValue('pear');
        await fixture.whenStable();
        expect(radios('Pear')[0]).toHaveAttribute('aria-checked', 'true');
        expect(control.dirty).toBe(false);
        changes.mockClear();

        const user = userEvent.setup();
        await user.click(radios('Apple')[0]);
        expect(control.value).toBe('apple');
        expect(control.dirty).toBe(true);
        expect(changes).toHaveBeenCalledTimes(1);

        expect(control.touched).toBe(false);
        await user.click(screen.getByRole('button', { name: 'after' }));
        expect(control.touched).toBe(true);

        control.reset();
        await fixture.whenStable();
        expect(radios().every(r => r.getAttribute('aria-checked') === 'false')).toBe(true);

        control.disable();
        await fixture.whenStable();
        expect(radios('Apple')[0]).toHaveAttribute('data-disabled');
        changes.mockClear();
        await user.click(radios('Apple')[0]);
        expect(changes).not.toHaveBeenCalled();
        control.enable();
        await fixture.whenStable();
        expect(radios('Apple')[0]).not.toHaveAttribute('data-disabled');
      });

      it('marks the group invalid once the control is', async () => {
        const { fixture } = await render(Reactive);
        const control = fixture.componentInstance.control;
        expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-invalid');
        control.markAsTouched();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
      });

      it('works with ngModel', async () => {
        const model = signal<string | null>('pear');
        const { fixture } = await render(
          `<volt-radio-group aria-label="Fruit" [ngModel]="model()" (ngModelChange)="model.set($event)">
             <volt-radio-item value="apple">Apple</volt-radio-item>
             <volt-radio-item value="pear">Pear</volt-radio-item>
           </volt-radio-group>`,
          { imports: [...imports, FormsModule], componentProperties: { model } }
        );
        await fixture.whenStable();
        expect(radios('Pear')[0]).toHaveAttribute('aria-checked', 'true');
        await userEvent.setup().click(radios('Apple')[0]);
        expect(model()).toBe('apple');
      });
    });
  });
}

export function describeToggleGroupContract(label: string, spec: ToggleGroupSpec): void {
  const imports = [spec.group, spec.item];
  const tools = (attrs = '', extra = '') => `
    <volt-toggle-group aria-label="Format" ${attrs}>
      <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
      <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
      <volt-toggle-group-item value="underline">Underline</volt-toggle-group-item>${extra}
    </volt-toggle-group>`;
  const single = (name: string) => screen.getByRole('radio', { name });
  const multi = (name: string) => screen.getByRole('button', { name });

  describe(`${label} toggle group — Volt contract`, () => {
    it('is a set of radios in single mode and of pressable buttons in multiple mode', async () => {
      const { container } = await render(tools(), { imports });
      expect(container.querySelector('volt-toggle-group')).toHaveAttribute('role', 'group');
      expect(screen.getAllByRole('radio')).toHaveLength(3);
      expect(single('Bold')).toHaveAttribute('aria-checked', 'false');
      expect(single('Bold')).not.toHaveAttribute('aria-pressed');
      expect(single('Bold').tagName).toBe('BUTTON');
    });

    it('uses aria-pressed, never radio semantics, in multiple mode', async () => {
      await render(tools('type="multiple"'), { imports });
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
      expect(multi('Bold')).toHaveAttribute('aria-pressed', 'false');
      expect(multi('Bold')).not.toHaveAttribute('aria-checked');
    });

    it('has unique ids', async () => {
      const { container } = await render(tools(), { imports });
      const ids = [...container.querySelectorAll('[id]')].map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('reflects a static initial value in the state and the styling hook', async () => {
      await render(tools('[value]="[\'italic\']"'), { imports });
      expect(single('Italic')).toHaveAttribute('aria-checked', 'true');
      expect(single('Italic')).toHaveAttribute('data-selected');
      expect(single('Bold')).not.toHaveAttribute('data-selected');
    });

    it('single mode: selects one at a time and always reports a string[]', async () => {
      const spy = vi.fn();
      await render(tools('(valueChange)="spy($event)"'), { imports, componentProperties: { spy } });
      const user = userEvent.setup();
      await user.click(single('Bold'));
      expect(spy).toHaveBeenLastCalledWith(['bold']);
      await user.click(single('Italic'));
      expect(spy).toHaveBeenLastCalledWith(['italic']);
      expect(single('Bold')).toHaveAttribute('aria-checked', 'false');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('single mode: pressing the pressed item clears it, unless allowDeselection is off', async () => {
      const spy = vi.fn();
      await render(
        `${tools('[value]="[\'bold\']" (valueChange)="spy($event)"')}
         <volt-toggle-group aria-label="Locked" [allowDeselection]="false" [value]="['x']" (valueChange)="spy($event)">
           <volt-toggle-group-item value="x">Locked item</volt-toggle-group-item>
         </volt-toggle-group>`,
        { imports, componentProperties: { spy } }
      );
      const user = userEvent.setup();
      await user.click(single('Bold'));
      expect(spy).toHaveBeenLastCalledWith([]);
      expect(single('Bold')).toHaveAttribute('aria-checked', 'false');
      spy.mockClear();
      await user.click(single('Locked item'));
      expect(spy).not.toHaveBeenCalled();
      expect(single('Locked item')).toHaveAttribute('aria-checked', 'true');
    });

    it('multiple mode: adds and removes, keeps selection order, never duplicates', async () => {
      const spy = vi.fn();
      await render(tools('type="multiple" (valueChange)="spy($event)"'), {
        imports,
        componentProperties: { spy },
      });
      const user = userEvent.setup();
      await user.click(multi('Underline'));
      await user.click(multi('Bold'));
      expect(spy).toHaveBeenLastCalledWith(['underline', 'bold']);
      await user.click(multi('Underline'));
      expect(spy).toHaveBeenLastCalledWith(['bold']);
      expect(multi('Bold')).toHaveAttribute('aria-pressed', 'true');
      expect(multi('Underline')).toHaveAttribute('aria-pressed', 'false');
    });

    it('multiple mode: presents a written duplicate once and emits no echo', async () => {
      const spy = vi.fn();
      await render(
        tools('type="multiple" [value]="[\'bold\', \'bold\']" (valueChange)="spy($event)"'),
        {
          imports,
          componentProperties: { spy },
        }
      );
      expect(multi('Bold')).toHaveAttribute('aria-pressed', 'true');
      await userEvent.setup().click(multi('Bold'));
      expect(spy).toHaveBeenLastCalledWith([]);
    });

    it('keeps a two-way binding in step and does not emit for programmatic changes', async () => {
      const spy = vi.fn();
      const value = signal<string[]>(['bold']);
      const { fixture } = await render(
        tools('type="multiple" [value]="value()" (valueChange)="spy($event)"'),
        { imports, componentProperties: { value, spy } }
      );
      value.set(['italic', 'underline']);
      await fixture.whenStable();
      expect(multi('Bold')).toHaveAttribute('aria-pressed', 'false');
      expect(multi('Italic')).toHaveAttribute('aria-pressed', 'true');
      expect(multi('Underline')).toHaveAttribute('aria-pressed', 'true');
      value.set([]);
      await fixture.whenStable();
      expect(multi('Italic')).toHaveAttribute('aria-pressed', 'false');
      expect(spy).not.toHaveBeenCalled();
    });

    it('writes user changes back through [(value)] as a string[]', async () => {
      const value = signal<string[]>([]);
      await render(tools('[(value)]="value"'), { imports, componentProperties: { value } });
      await userEvent.setup().click(single('Italic'));
      expect(value()).toEqual(['italic']);
    });

    it('keeps the value when the type switches between single and multiple', async () => {
      const type = signal<'single' | 'multiple'>('multiple');
      const { fixture } = await render(tools('[type]="type()" [value]="[\'bold\', \'italic\']"'), {
        imports,
        componentProperties: { type },
      });
      expect(multi('Italic')).toHaveAttribute('aria-pressed', 'true');
      type.set('single');
      await fixture.whenStable();
      expect(single('Bold')).toHaveAttribute('aria-checked', 'true');
    });

    it('ignores a disabled item and a disabled group', async () => {
      const spy = vi.fn();
      await render(
        `<volt-toggle-group aria-label="a" (valueChange)="spy($event)">
           <volt-toggle-group-item value="a" disabled>Off item</volt-toggle-group-item>
           <volt-toggle-group-item value="b">On item</volt-toggle-group-item>
         </volt-toggle-group>
         <volt-toggle-group aria-label="b" disabled (valueChange)="spy($event)">
           <volt-toggle-group-item value="c">Group off</volt-toggle-group-item>
         </volt-toggle-group>`,
        { imports, componentProperties: { spy } }
      );
      const user = userEvent.setup();
      await user.click(single('Off item'));
      await user.click(single('Group off'));
      expect(spy).not.toHaveBeenCalled();
      expect(single('Off item')).toHaveAttribute('data-disabled');
      expect(single('Group off')).toHaveAttribute('data-disabled');
      await user.click(single('On item'));
      expect(spy).toHaveBeenCalledExactlyOnceWith(['b']);
    });

    it('is one tab stop; arrows move focus without changing the value; Space/Enter press', async () => {
      const spy = vi.fn();
      await render(`${tools('(valueChange)="spy($event)"')}<button>after</button>`, {
        imports,
        componentProperties: { spy },
      });
      const user = userEvent.setup();
      await user.tab();
      expect(single('Bold')).toHaveFocus();
      expect(single('Italic')).toHaveAttribute('tabindex', '-1');
      await user.keyboard('{ArrowRight}');
      expect(single('Italic')).toHaveFocus();
      expect(spy).not.toHaveBeenCalled();
      await user.keyboard(' ');
      expect(spy).toHaveBeenLastCalledWith(['italic']);
      await user.keyboard('{ArrowRight}{Enter}');
      expect(spy).toHaveBeenLastCalledWith(['underline']);
      await user.tab();
      expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
    });

    it('wraps at the ends and honours vertical orientation', async () => {
      await render(
        `${tools('type="multiple"')}
         ${tools('type="multiple" orientation="vertical" aria-label="v"').replace(/>(Bold|Italic|Underline)</g, '>V$1<')}`,
        { imports }
      );
      const user = userEvent.setup();
      await user.tab();
      expect(multi('Bold')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(multi('Underline')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(multi('Bold')).toHaveFocus();
      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(multi('VItalic')).toHaveFocus();
      await user.keyboard('{ArrowUp}{ArrowUp}');
      expect(multi('VUnderline')).toHaveFocus();
    });

    it('recovers its tab stop when items are added and removed', async () => {
      const show = signal(true);
      const { fixture } = await render(
        `<volt-toggle-group aria-label="x" type="multiple">
           @if (show()) { <volt-toggle-group-item value="a">A</volt-toggle-group-item> }
           <volt-toggle-group-item value="b">B</volt-toggle-group-item>
         </volt-toggle-group>`,
        { imports, componentProperties: { show } }
      );
      show.set(false);
      await fixture.whenStable();
      await userEvent.setup().tab();
      expect(multi('B')).toHaveFocus();
      show.set(true);
      await fixture.whenStable();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    describe('with Angular Forms', () => {
      @Component({
        selector: 'app-contract-toggle-reactive',
        imports: [...(imports as never[]), ReactiveFormsModule],
        template: `
          <volt-toggle-group aria-label="Format" type="multiple" [formControl]="control">
            <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
            <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
          </volt-toggle-group>
          <button type="button">after</button>
        `,
      })
      class Reactive {
        readonly control = new FormControl<string[]>([], { nonNullable: true });
      }

      it('writes silently, emits one change per user press, tracks dirty/touched, resets, disables', async () => {
        const { fixture } = await render(Reactive);
        const control = fixture.componentInstance.control;
        const changes = vi.fn();
        control.valueChanges.subscribe(changes);

        control.setValue(['italic']);
        await fixture.whenStable();
        expect(multi('Italic')).toHaveAttribute('aria-pressed', 'true');
        expect(control.dirty).toBe(false);
        changes.mockClear();

        const user = userEvent.setup();
        await user.click(multi('Bold'));
        expect(control.value).toEqual(['italic', 'bold']);
        expect(control.dirty).toBe(true);
        expect(changes).toHaveBeenCalledTimes(1);

        expect(control.touched).toBe(false);
        await user.click(screen.getByRole('button', { name: 'after' }));
        expect(control.touched).toBe(true);

        control.reset();
        await fixture.whenStable();
        expect(control.value).toEqual([]);
        expect(multi('Bold')).toHaveAttribute('aria-pressed', 'false');

        control.disable();
        await fixture.whenStable();
        expect(multi('Bold')).toHaveAttribute('data-disabled');
        changes.mockClear();
        await user.click(multi('Bold'));
        expect(changes).not.toHaveBeenCalled();
        control.enable();
        await fixture.whenStable();
        expect(multi('Bold')).not.toHaveAttribute('data-disabled');
      });

      it('treats a null written value as empty', async () => {
        const { fixture } = await render(Reactive);
        fixture.componentInstance.control.setValue(null as never);
        await fixture.whenStable();
        expect(multi('Bold')).toHaveAttribute('aria-pressed', 'false');
      });

      it('works with ngModel', async () => {
        const model = signal<string[]>(['bold']);
        const { fixture } = await render(
          `<volt-toggle-group aria-label="Format" type="multiple" [ngModel]="model()" (ngModelChange)="model.set($event)">
             <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
             <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
           </volt-toggle-group>`,
          { imports: [...imports, FormsModule], componentProperties: { model } }
        );
        await fixture.whenStable();
        expect(multi('Bold')).toHaveAttribute('aria-pressed', 'true');
        await userEvent.setup().click(multi('Italic'));
        expect(model()).toEqual(['bold', 'italic']);
      });
    });
  });
}
