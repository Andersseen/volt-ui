import { Component, signal, Type } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

/*
 * The observable Volt contract of Checkbox, Switch and Toggle, written once and run against every
 * headless backend (ng-primitives and Quartz). A backend is "supported" only while this passes for
 * it: the suite asserts what a consumer can observe — roles, ARIA, the native value, Forms state,
 * emitted events — never which primitive produced it.
 */

export interface BooleanControlSpec {
  /** Component under test (selector `volt-<tag>`). */
  readonly component: Type<unknown>;
  readonly tag: 'checkbox' | 'switch' | 'toggle';
  readonly role: 'checkbox' | 'switch' | 'button';
  /** The aria attribute carrying the on/off state. */
  readonly stateAttr: 'aria-checked' | 'aria-pressed';
  /** Name of the model + its change output (`checked`/`pressed`). */
  readonly model: 'checked' | 'pressed';
  /** The `data-*` attribute styling keys the "on" state on. */
  readonly onDataAttr: 'data-checked' | 'data-selected';
}

export function describeBooleanControlContract(label: string, spec: BooleanControlSpec): void {
  const { component, tag, role, stateAttr, model, onDataAttr } = spec;
  const changeOutput = `${model}Change`;
  const control = () => screen.getByRole(role, { name: 'Subject' });

  describe(`${label} ${tag} — Volt contract`, () => {
    it('exposes a native button with the right role and accessible name', async () => {
      await render(`<volt-${tag} aria-label="Subject" />`, { imports: [component] });
      const el = control();
      expect(el.tagName).toBe('BUTTON');
      expect(el).toHaveAttribute('type', 'button');
      expect(el).toHaveAttribute(stateAttr, 'false');
      expect(el).not.toHaveAttribute(onDataAttr);
    });

    it.skipIf(tag === 'toggle')(
      'forwards id and aria-label to the native button only',
      async () => {
        const { container } = await render(`<volt-${tag} id="mine" ariaLabel="Subject" />`, {
          imports: [component],
        });
        expect(control()).toHaveAttribute('id', 'mine');
        expect(container.querySelectorAll('#mine')).toHaveLength(1);
        expect(container.querySelector(`volt-${tag}`)).not.toHaveAttribute('aria-label');
      }
    );

    it.skipIf(tag === 'toggle')('generates a unique id per instance', async () => {
      const { container } = await render(
        `<volt-${tag} aria-label="A" /><volt-${tag} aria-label="B" />`,
        { imports: [component] }
      );
      const ids = [...container.querySelectorAll('button')].map(b => b.id);
      expect(new Set(ids).size).toBe(2);
      expect(ids.every(id => id.length > 0)).toBe(true);
    });

    it('reflects the bound model and its styling hook', async () => {
      await render(`<volt-${tag} aria-label="Subject" [${model}]="true" />`, {
        imports: [component],
      });
      expect(control()).toHaveAttribute(stateAttr, 'true');
      expect(control()).toHaveAttribute(onDataAttr);
    });

    it('toggles on click and emits the change exactly once per activation', async () => {
      const spy = vi.fn();
      await render(`<volt-${tag} aria-label="Subject" (${changeOutput})="spy($event)" />`, {
        imports: [component],
        componentProperties: { spy },
      });
      const user = userEvent.setup();
      await user.click(control());
      expect(control()).toHaveAttribute(stateAttr, 'true');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith(true);
      await user.click(control());
      expect(control()).toHaveAttribute(stateAttr, 'false');
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(false);
    });

    it('activates with Space and Enter-less keyboard parity (Space toggles)', async () => {
      const spy = vi.fn();
      await render(`<volt-${tag} aria-label="Subject" (${changeOutput})="spy($event)" />`, {
        imports: [component],
        componentProperties: { spy },
      });
      const user = userEvent.setup();
      await user.tab();
      expect(control()).toHaveFocus();
      await user.keyboard(' ');
      expect(control()).toHaveAttribute(stateAttr, 'true');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does not emit for programmatic changes to the bound model', async () => {
      const spy = vi.fn();
      const value = signal(false);
      const { fixture } = await render(
        `<volt-${tag} aria-label="Subject" [${model}]="value()" (${changeOutput})="spy($event)" />`,
        { imports: [component], componentProperties: { value, spy } }
      );
      value.set(true);
      await fixture.whenStable();
      expect(control()).toHaveAttribute(stateAttr, 'true');
      expect(spy).not.toHaveBeenCalled();
    });

    it('ignores activation while disabled', async () => {
      const spy = vi.fn();
      await render(
        `<volt-${tag} aria-label="Subject" disabled (${changeOutput})="spy($event)" />`,
        {
          imports: [component],
          componentProperties: { spy },
        }
      );
      const el = control();
      expect(el).toHaveAttribute('data-disabled');
      await userEvent.setup().click(el);
      expect(el).toHaveAttribute(stateAttr, 'false');
      expect(spy).not.toHaveBeenCalled();
    });

    it('is focusable and shows no console errors', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await render(`<volt-${tag} aria-label="Subject" />`, { imports: [component] });
      control().focus();
      expect(control()).toHaveFocus();
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      error.mockRestore();
      warn.mockRestore();
    });

    it('carries the invalid state once touched (Reactive Forms)', async () => {
      const ctrl = new FormControl(false, Validators.requiredTrue);
      const { fixture } = await render(
        `<volt-${tag} aria-label="Subject" [formControl]="ctrl" />`,
        {
          imports: [component, ReactiveFormsModule],
          componentProperties: { ctrl },
        }
      );
      expect(control()).not.toHaveAttribute('aria-invalid');
      ctrl.markAsTouched();
      await fixture.whenStable();
      expect(control()).toHaveAttribute('aria-invalid', 'true');
    });

    describe('Reactive Forms', () => {
      it('writes values silently, then reports user changes, dirty and touched', async () => {
        const ctrl = new FormControl(false);
        const seen: unknown[] = [];
        ctrl.valueChanges.subscribe(v => seen.push(v));
        const { fixture } = await render(
          `<volt-${tag} aria-label="Subject" [formControl]="ctrl" />`,
          {
            imports: [component, ReactiveFormsModule],
            componentProperties: { ctrl },
          }
        );

        ctrl.setValue(true);
        await fixture.whenStable();
        expect(control()).toHaveAttribute(stateAttr, 'true');
        // setValue itself emits once through valueChanges; the control must not echo it back.
        expect(seen).toEqual([true]);
        expect(ctrl.dirty).toBe(false);

        const user = userEvent.setup();
        await user.click(control());
        expect(ctrl.value).toBe(false);
        expect(ctrl.dirty).toBe(true);
        expect(seen).toEqual([true, false]);

        expect(ctrl.touched).toBe(false);
        await user.tab();
        expect(ctrl.touched).toBe(true);
      });

      it('follows reset and disable/enable', async () => {
        const ctrl = new FormControl(true);
        const { fixture } = await render(
          `<volt-${tag} aria-label="Subject" [formControl]="ctrl" />`,
          {
            imports: [component, ReactiveFormsModule],
            componentProperties: { ctrl },
          }
        );
        expect(control()).toHaveAttribute(stateAttr, 'true');

        ctrl.reset(false);
        await fixture.whenStable();
        expect(control()).toHaveAttribute(stateAttr, 'false');

        ctrl.disable();
        await fixture.whenStable();
        // `data-disabled` is the shared hook. Native `disabled` is not part of the contract for
        // Toggle: ng-primitives keeps it focusable with `aria-disabled`, Quartz uses `disabled`.
        expect(control()).toHaveAttribute('data-disabled');
        ctrl.enable();
        await fixture.whenStable();
        expect(control()).not.toHaveAttribute('data-disabled');
      });

      it('treats null as off', async () => {
        const ctrl = new FormControl<boolean | null>(null);
        await render(`<volt-${tag} aria-label="Subject" [formControl]="ctrl" />`, {
          imports: [component, ReactiveFormsModule],
          componentProperties: { ctrl },
        });
        expect(control()).toHaveAttribute(stateAttr, 'false');
      });
    });

    describe('Template-driven Forms', () => {
      it('binds with ngModel in both directions', async () => {
        @Component({
          selector: 'app-host',
          imports: [component, FormsModule],
          template: `<volt-${tag}
            aria-label="Subject"
            [ngModel]="on()"
            (ngModelChange)="on.set($event)"
          />`,
        })
        class Host {
          readonly on = signal(false);
        }
        const { fixture } = await render(Host);
        const user = userEvent.setup();
        await user.click(control());
        expect(fixture.componentInstance.on()).toBe(true);

        fixture.componentInstance.on.set(false);
        await fixture.whenStable();
        await fixture.whenStable();
        expect(control()).toHaveAttribute(stateAttr, 'false');
      });
    });

    it('supports two-way binding on the model', async () => {
      @Component({
        selector: 'app-host',
        imports: [component],
        template: `<volt-${tag} aria-label="Subject" [(${model})]="on" />`,
      })
      class Host {
        readonly on = signal(false);
      }
      const { fixture } = await render(Host);
      await userEvent.setup().click(control());
      expect(fixture.componentInstance.on()).toBe(true);
    });

    it('can be inserted and removed dynamically', async () => {
      @Component({
        selector: 'app-host',
        imports: [component],
        template: `@if (show()) {
          <volt-${tag} aria-label="Subject" />
        }`,
      })
      class Host {
        readonly show = signal(false);
      }
      const { fixture } = await render(Host);
      expect(screen.queryByRole(role)).toBeNull();
      fixture.componentInstance.show.set(true);
      await fixture.whenStable();
      expect(control()).toBeInTheDocument();
      fixture.componentInstance.show.set(false);
      await fixture.whenStable();
      expect(screen.queryByRole(role)).toBeNull();
    });
  });
}

/** Checkbox only: the checked/indeterminate pair. */
export function describeCheckboxIndeterminateContract(
  label: string,
  component: Type<unknown>
): void {
  describe(`${label} checkbox — indeterminate`, () => {
    const box = () => screen.getByRole('checkbox', { name: 'Subject' });

    it('exposes aria-checked="mixed" and the styling hook', async () => {
      await render(`<volt-checkbox aria-label="Subject" [indeterminate]="true" />`, {
        imports: [component],
      });
      expect(box()).toHaveAttribute('aria-checked', 'mixed');
      expect(box()).toHaveAttribute('data-indeterminate');
      expect(box()).not.toHaveAttribute('data-checked');
    });

    it('resolves to checked on user activation and clears indeterminate', async () => {
      const checked = vi.fn();
      const indeterminate = vi.fn();
      await render(
        `<volt-checkbox aria-label="Subject" [indeterminate]="true"
           (checkedChange)="checked($event)" (indeterminateChange)="indeterminate($event)" />`,
        { imports: [component], componentProperties: { checked, indeterminate } }
      );
      await userEvent.setup().click(box());
      expect(box()).toHaveAttribute('aria-checked', 'true');
      expect(checked).toHaveBeenCalledTimes(1);
      expect(checked).toHaveBeenLastCalledWith(true);
      expect(indeterminate).toHaveBeenLastCalledWith(false);
    });

    it('clears indeterminate when a Forms value is written', async () => {
      const ctrl = new FormControl(false);
      const { fixture } = await render(
        `<volt-checkbox aria-label="Subject" [indeterminate]="true" [formControl]="ctrl" />`,
        { imports: [component, ReactiveFormsModule], componentProperties: { ctrl } }
      );
      ctrl.setValue(true);
      await fixture.whenStable();
      expect(box()).toHaveAttribute('aria-checked', 'true');
    });

    it('marks the native control required', async () => {
      await render(`<volt-checkbox aria-label="Subject" required />`, { imports: [component] });
      expect(box()).toHaveAttribute('aria-required', 'true');
    });
  });
}
