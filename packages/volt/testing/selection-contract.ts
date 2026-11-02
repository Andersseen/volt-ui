import { Component, signal, Type } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

/*
 * The observable Volt contract of Listbox and Select, written once and run against every headless
 * backend (see `disclosure-contract.ts` and `group-contract.ts` for the other families). It asserts
 * what a consumer can observe — roles, ARIA relationships, keyboard, emitted values, Forms,
 * `data-*` styling hooks — never which primitive produced it. Differences that are real and
 * intentional live in the backend's own spec, with the reason.
 */

export interface ListboxSpec {
  readonly listbox: Type<unknown>;
  readonly option: Type<unknown>;
  readonly section: Type<unknown>;
  readonly header: Type<unknown>;
  readonly trigger: Type<unknown>;
}

export interface SelectSpec {
  readonly select: Type<unknown>;
  readonly content: Type<unknown>;
  readonly item: Type<unknown>;
  readonly label: Type<unknown>;
  readonly separator: Type<unknown>;
}

const option = (name: string) => screen.getByRole('option', { name });

export function describeListboxContract(label: string, spec: ListboxSpec): void {
  const imports = [
    spec.listbox,
    spec.option,
    spec.section,
    spec.header,
    spec.trigger,
    ReactiveFormsModule,
    FormsModule,
  ];
  const listbox = (attrs = '', extra = '') => `
    <volt-listbox aria-label="Framework" ${attrs}>
      <volt-listbox-option value="angular">Angular</volt-listbox-option>
      <volt-listbox-option value="react" disabled>React</volt-listbox-option>
      <volt-listbox-option value="vue">Vue</volt-listbox-option>
      <volt-listbox-option value="svelte">Svelte</volt-listbox-option>${extra}
    </volt-listbox>`;
  const selected = () =>
    screen.getAllByRole('option').filter(o => o.getAttribute('aria-selected') === 'true');

  describe(`${label} listbox — Volt contract`, () => {
    it('exposes listbox / option semantics with unique ids and no dangling references', async () => {
      const { container } = await render(listbox('mode="multiple"'), { imports });
      const box = screen.getByRole('listbox', { name: 'Framework' });
      expect(box).toHaveAttribute('aria-multiselectable', 'true');
      expect(screen.getAllByRole('option')).toHaveLength(4);
      const ids = [...container.querySelectorAll('[id]')].map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(option('React')).toHaveAttribute('aria-disabled', 'true');
      expect(option('Angular')).toHaveAttribute('aria-selected', 'false');
      for (const ref of container.querySelectorAll('[aria-activedescendant]')) {
        const id = ref.getAttribute('aria-activedescendant');
        if (id) expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
      }
    });

    it('is single-select by default and not multiselectable', async () => {
      await render(listbox(), { imports });
      expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-multiselectable', 'true');
    });

    it('shows the initial value and writes the styling hooks Volt classes use', async () => {
      await render(listbox('[value]="[\'vue\']"'), { imports });
      expect(option('Vue')).toHaveAttribute('aria-selected', 'true');
      expect(option('Vue')).toHaveAttribute('data-selected');
      expect(option('Angular')).not.toHaveAttribute('data-selected');
      expect(option('React')).toHaveAttribute('data-disabled');
      expect(option('Angular')).not.toHaveAttribute('data-disabled');
    });

    it('keeps an array value in single mode and replaces it on a click, emitting once', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(listbox('[value]="[\'vue\']" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.click(option('Svelte'));
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith(['svelte']);
      expect(selected().map(o => o.textContent?.trim())).toEqual(['Svelte']);
    });

    it('toggles values in multiple mode', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(listbox('mode="multiple" [value]="[\'vue\']" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.click(option('Angular'));
      expect(changed).toHaveBeenLastCalledWith(['vue', 'angular']);
      await user.click(option('Vue'));
      expect(changed).toHaveBeenLastCalledWith(['angular']);
      expect(changed).toHaveBeenCalledTimes(2);
    });

    it('follows programmatic writes without emitting, and two-way binding stays in sync', async () => {
      @Component({
        selector: 'app-listbox-host',
        imports,
        template: listbox('[(value)]="current" (valueChange)="changed($event)"'),
      })
      class Host {
        readonly current = signal<string[]>(['angular']);
        readonly changed = vi.fn();
      }
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      fixture.componentInstance.current.set(['svelte']);
      await fixture.whenStable();
      expect(option('Svelte')).toHaveAttribute('aria-selected', 'true');
      expect(option('Angular')).toHaveAttribute('aria-selected', 'false');
      expect(fixture.componentInstance.changed).not.toHaveBeenCalled();
      await user.click(option('Vue'));
      expect(fixture.componentInstance.current()).toEqual(['vue']);
      expect(fixture.componentInstance.changed).toHaveBeenCalledTimes(1);
    });

    it('clears the selection when the value is emptied', async () => {
      @Component({
        selector: 'app-listbox-empty-host',
        imports,
        template: listbox('[(value)]="current"'),
      })
      class Host {
        readonly current = signal<string[]>(['angular']);
      }
      const { fixture } = await render(Host);
      fixture.componentInstance.current.set([]);
      await fixture.whenStable();
      expect(selected()).toHaveLength(0);
    });

    it('compares object values with compareWith', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      @Component({
        selector: 'app-listbox-compare-host',
        imports,
        template: ` <volt-listbox
          aria-label="Users"
          [value]="[{ id: 2 }]"
          [compareWith]="same"
          (valueChange)="changed($event)"
        >
          <volt-listbox-option [value]="{ id: 1 }">One</volt-listbox-option>
          <volt-listbox-option [value]="{ id: 2 }">Two</volt-listbox-option>
        </volt-listbox>`,
      })
      class Host {
        readonly same = (a: { id: number }, b: { id: number }) => a.id === b.id;
        readonly changed = changed;
      }
      await render(Host);
      expect(option('Two')).toHaveAttribute('aria-selected', 'true');
      await user.click(option('One'));
      expect(changed).toHaveBeenCalledTimes(1);
      expect(option('One')).toHaveAttribute('aria-selected', 'true');
      expect(option('Two')).toHaveAttribute('aria-selected', 'false');
    });

    it('ignores clicks on a disabled option', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(listbox('(valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.click(option('React'));
      expect(changed).not.toHaveBeenCalled();
      expect(selected()).toHaveLength(0);
    });

    it('is inert when disabled', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(listbox('disabled (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      const box = screen.getByRole('listbox');
      expect(box).toHaveAttribute('data-disabled');
      expect(box).toHaveAttribute('tabindex', '-1');
      await user.click(option('Vue'));
      expect(changed).not.toHaveBeenCalled();
    });

    it('moves with the arrow keys, Home and End, skips disabled options and selects with Enter and Space', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(listbox('(valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.tab();
      const box = screen.getByRole('listbox');
      expect(box).toHaveFocus();
      expect(box.getAttribute('aria-activedescendant')).toBe(option('Angular').id);
      await user.keyboard('{ArrowDown}');
      expect(box.getAttribute('aria-activedescendant')).toBe(option('Vue').id);
      await user.keyboard('{Enter}');
      expect(changed).toHaveBeenLastCalledWith(['vue']);
      await user.keyboard('{End}');
      expect(box.getAttribute('aria-activedescendant')).toBe(option('Svelte').id);
      await user.keyboard(' ');
      expect(changed).toHaveBeenLastCalledWith(['svelte']);
      await user.keyboard('{Home}');
      expect(box.getAttribute('aria-activedescendant')).toBe(option('Angular').id);
      expect(option('Angular')).toHaveAttribute('data-active');
      expect(option('Svelte')).not.toHaveAttribute('data-active');
    });

    it('moves the active option by typeahead', async () => {
      const user = userEvent.setup();
      await render(listbox(), { imports });
      await user.tab();
      await user.keyboard('s');
      expect(screen.getByRole('listbox').getAttribute('aria-activedescendant')).toBe(
        option('Svelte').id
      );
    });

    it('recovers the active option when it is removed, and registers options added later', async () => {
      const show = signal(true);
      const user = userEvent.setup();
      const { fixture } = await render(
        `<volt-listbox aria-label="Framework">
           <volt-listbox-option value="angular">Angular</volt-listbox-option>
           @if (show()) { <volt-listbox-option value="vue">Vue</volt-listbox-option> }
           <volt-listbox-option value="svelte">Svelte</volt-listbox-option>
         </volt-listbox>`,
        { imports, componentProperties: { show } }
      );
      await user.tab();
      await user.keyboard('{ArrowDown}');
      const box = screen.getByRole('listbox');
      expect(box.getAttribute('aria-activedescendant')).toBeTruthy();
      show.set(false);
      await fixture.whenStable();
      const active = box.getAttribute('aria-activedescendant');
      expect(active === '' || active === null || document.getElementById(active) !== null).toBe(
        true
      );
      await user.keyboard('{ArrowDown}');
      expect(screen.getAllByRole('option')).toHaveLength(2);
      const now = box.getAttribute('aria-activedescendant');
      expect(screen.getAllByRole('option').some(o => o.id === now)).toBe(true);
      show.set(true);
      await fixture.whenStable();
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('names a section by its header only while it has one', async () => {
      const { container } = await render(
        `<volt-listbox aria-label="Framework">
           <volt-listbox-section>
             <volt-listbox-header>Frameworks</volt-listbox-header>
             <volt-listbox-option value="angular">Angular</volt-listbox-option>
           </volt-listbox-section>
           <volt-listbox-section>
             <volt-listbox-option value="vue">Vue</volt-listbox-option>
           </volt-listbox-section>
         </volt-listbox>`,
        { imports }
      );
      const groups = screen.getAllByRole('group');
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveAccessibleName('Frameworks');
      expect(groups[1]).not.toHaveAttribute('aria-labelledby');
      const header = container.querySelector('volt-listbox-header')!;
      expect(header).toHaveAttribute('role', 'presentation');
      expect(header.id).toBeTruthy();
    });

    it('keeps a consumer-provided option id', async () => {
      await render(
        `<volt-listbox aria-label="Framework">
           <volt-listbox-option id="opt-angular" value="angular">Angular</volt-listbox-option>
           <volt-listbox-option value="vue">Vue</volt-listbox-option>
         </volt-listbox>`,
        { imports }
      );
      expect(option('Angular').id).toBe('opt-angular');
      const user = userEvent.setup();
      await user.tab();
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-activedescendant', 'opt-angular');
    });

    it('merges consumer classes onto the listbox and its options', async () => {
      await render(
        `<volt-listbox aria-label="Framework" class="my-box">
           <volt-listbox-option value="angular" class="my-option">Angular</volt-listbox-option>
         </volt-listbox>`,
        { imports }
      );
      expect(screen.getByRole('listbox')).toHaveClass('my-box', 'rounded-md');
      expect(option('Angular')).toHaveClass('my-option', 'cursor-pointer');
    });

    describe('with Angular Forms', () => {
      const reactive = (control: FormControl<string[]>, attrs = '') => ({
        template: listbox(`[formControl]="control" ${attrs}`),
        componentProperties: { control },
      });

      it('writes the control value into the options and reports user changes back', async () => {
        const control = new FormControl<string[]>(['vue'], { nonNullable: true });
        const user = userEvent.setup();
        const { template, componentProperties } = reactive(control);
        await render(template, { imports, componentProperties });
        expect(option('Vue')).toHaveAttribute('aria-selected', 'true');
        await user.click(option('Angular'));
        expect(control.value).toEqual(['angular']);
        control.setValue(['svelte']);
        await waitFor(() => expect(option('Svelte')).toHaveAttribute('aria-selected', 'true'));
        expect(option('Angular')).toHaveAttribute('aria-selected', 'false');
      });

      it('does not echo a programmatic write back into the control', async () => {
        const control = new FormControl<string[]>([], { nonNullable: true });
        const spy = vi.fn();
        control.valueChanges.subscribe(spy);
        const { template, componentProperties } = reactive(control);
        await render(template, { imports, componentProperties });
        control.setValue(['vue']);
        await waitFor(() => expect(option('Vue')).toHaveAttribute('aria-selected', 'true'));
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('resets to empty, disables and enables with the control', async () => {
        const control = new FormControl<string[] | null>(['vue']);
        await render(listbox('[formControl]="control"'), {
          imports,
          componentProperties: { control },
        });
        control.reset();
        await waitFor(() => expect(selected()).toHaveLength(0));
        control.disable();
        await waitFor(() => expect(screen.getByRole('listbox')).toHaveAttribute('tabindex', '-1'));
        expect(screen.getByRole('listbox')).toHaveAttribute('data-disabled');
        control.enable();
        await waitFor(() => expect(screen.getByRole('listbox')).toHaveAttribute('tabindex', '0'));
      });

      it('marks the control touched on focus loss and exposes the invalid state', async () => {
        const control = new FormControl<string[]>([], {
          nonNullable: true,
          validators: Validators.required,
        });
        const user = userEvent.setup();
        const { template, componentProperties } = reactive(control);
        await render(template, { imports, componentProperties });
        const box = screen.getByRole('listbox');
        expect(box).not.toHaveAttribute('aria-invalid');
        await user.tab();
        await user.tab();
        expect(control.touched).toBe(true);
        await waitFor(() => expect(box).toHaveAttribute('aria-invalid', 'true'));
      });

      it('works with ngModel', async () => {
        const user = userEvent.setup();
        @Component({
          selector: 'app-listbox-ngmodel-host',
          imports,
          template: listbox('[(ngModel)]="model"'),
        })
        class Host {
          model: string[] = ['vue'];
        }
        const { fixture } = await render(Host);
        await fixture.whenStable();
        expect(option('Vue')).toHaveAttribute('aria-selected', 'true');
        await user.click(option('Angular'));
        expect(fixture.componentInstance.model).toEqual(['angular']);
      });
    });
  });
}

export function describeSelectContract(label: string, spec: SelectSpec): void {
  const imports = [
    spec.select,
    spec.content,
    spec.item,
    spec.label,
    spec.separator,
    ReactiveFormsModule,
    FormsModule,
  ];
  const select = (attrs = '', extra = '') => `
    <volt-select aria-label="Framework" placeholder="Pick one" ${attrs}>
      <volt-select-content>
        <volt-select-label>Frameworks</volt-select-label>
        <volt-select-item value="angular">Angular</volt-select-item>
        <volt-select-item value="react" disabled>React</volt-select-item>
        <volt-select-separator />
        <volt-select-item value="vue">Vue</volt-select-item>
        <volt-select-item value="svelte">Svelte</volt-select-item>${extra}
      </volt-select-content>
    </volt-select>`;
  const trigger = () => screen.getByRole('combobox');
  const open = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(trigger());
    return screen.findByRole('listbox');
  };
  /** Quartz activates (and focuses) the first option one animation frame after it opens. */
  const settled = () =>
    waitFor(() => expect(document.activeElement).not.toBe(trigger()), { timeout: 300 }).catch(
      () => undefined
    );

  describe(`${label} select — Volt contract`, () => {
    it('renders a closed combobox trigger with the placeholder and the accessible name', async () => {
      const { container } = await render(select(), { imports });
      expect(trigger()).toHaveAccessibleName('Framework');
      expect(trigger()).toHaveTextContent('Pick one');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(trigger().tagName).toBe('BUTTON');
      expect(screen.queryByRole('listbox')).toBeNull();
      // `aria-label` belongs to the trigger, not to the host.
      expect(container.querySelector('volt-select')).not.toHaveAttribute('aria-label');
    });

    it('shows the label of the initial value through displayWith', async () => {
      await render(select('[value]="\'vue\'" [displayWith]="upper"'), {
        imports,
        componentProperties: { upper: (v: unknown) => String(v).toUpperCase() },
      });
      expect(trigger()).toHaveTextContent('VUE');
    });

    it('opens on click with a labelled listbox of options the trigger controls', async () => {
      const user = userEvent.setup();
      await render(select('[value]="\'vue\'"'), { imports });
      const box = await open(user);
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
      expect(trigger().getAttribute('aria-controls')).toBe(box.id);
      expect(screen.getAllByRole('option')).toHaveLength(4);
      expect(option('Vue')).toHaveAttribute('aria-selected', 'true');
      expect(option('Vue')).toHaveAttribute('data-selected');
      expect(option('React')).toHaveAttribute('data-disabled');
      expect(document.querySelectorAll('[role="listbox"]')).toHaveLength(1);
    });

    it('selects on click, closes, returns focus to the trigger and emits once', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(select('(valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await open(user);
      await user.click(option('Svelte'));
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      expect(trigger()).toHaveTextContent('svelte');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith('svelte');
    });

    it('does not emit when the selected option is chosen again', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(select('[value]="\'vue\'" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await open(user);
      await user.click(option('Vue'));
      expect(changed).not.toHaveBeenCalled();
    });

    it('ignores a disabled option', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(select('(valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await open(user);
      await user.click(option('React'));
      expect(changed).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens from the keyboard, moves, selects with Enter and closes', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(select('value="angular" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.tab();
      expect(trigger()).toHaveFocus();
      await user.keyboard('{Enter}');
      await screen.findByRole('listbox');
      await settled();
      // Opening activates the selected option; ArrowDown skips the disabled one.
      await user.keyboard('{ArrowDown}{Enter}');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith('vue');
    });

    it('closes on Escape and returns focus to the trigger without changing the value', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(select('(valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await open(user);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      expect(changed).not.toHaveBeenCalled();
    });

    it('closes on an outside pointer press', async () => {
      const user = userEvent.setup();
      await render(`<button>outside</button>${select()}`, { imports });
      await open(user);
      await user.click(screen.getByRole('button', { name: 'outside' }));
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    });

    it('is inert when disabled', async () => {
      const user = userEvent.setup();
      await render(select('disabled'), { imports });
      expect(trigger()).toBeDisabled();
      await user.click(trigger());
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('selects several values and keeps the popup open in multiple mode', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(
        select(
          'multiple [value]="[\'angular\']" [displayWith]="upper" (valueChange)="changed($event)"'
        ),
        {
          imports,
          componentProperties: { changed, upper: (v: unknown) => String(v).toUpperCase() },
        }
      );
      expect(trigger()).toHaveTextContent('ANGULAR');
      await open(user);
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
      await user.click(option('Vue'));
      expect(changed).toHaveBeenLastCalledWith(['angular', 'vue']);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(trigger()).toHaveTextContent('ANGULAR, VUE');
      await user.click(option('Angular'));
      expect(changed).toHaveBeenLastCalledWith(['vue']);
      expect(changed).toHaveBeenCalledTimes(2);
    });

    it('follows programmatic writes without emitting, and two-way binding stays in sync', async () => {
      @Component({
        selector: 'app-select-host',
        imports,
        template: select('[(value)]="current" (valueChange)="changed($event)"'),
      })
      class Host {
        readonly current = signal<string | undefined>('angular');
        readonly changed = vi.fn();
      }
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      fixture.componentInstance.current.set('svelte');
      await fixture.whenStable();
      expect(trigger()).toHaveTextContent('svelte');
      expect(fixture.componentInstance.changed).not.toHaveBeenCalled();
      await open(user);
      expect(option('Svelte')).toHaveAttribute('aria-selected', 'true');
      await user.click(option('Vue'));
      expect(fixture.componentInstance.current()).toBe('vue');
      expect(fixture.componentInstance.changed).toHaveBeenCalledTimes(1);
      fixture.componentInstance.current.set(undefined);
      await fixture.whenStable();
      expect(trigger()).toHaveTextContent('Pick one');
    });

    it('compares object values with compareWith and displays them with displayWith', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      @Component({
        selector: 'app-select-compare-host',
        imports,
        template: ` <volt-select
          aria-label="User"
          [value]="{ id: 2, name: 'Two' }"
          [compareWith]="same"
          [displayWith]="name"
          (valueChange)="changed($event)"
        >
          <volt-select-content>
            <volt-select-item [value]="{ id: 1, name: 'One' }">One</volt-select-item>
            <volt-select-item [value]="{ id: 2, name: 'Two' }">Two</volt-select-item>
          </volt-select-content>
        </volt-select>`,
      })
      class Host {
        readonly same = (a: unknown, b: unknown) =>
          (a as { id: number }).id === (b as { id: number }).id;
        readonly name = (v: unknown) => (v as { name: string }).name;
        readonly changed = changed;
      }
      await render(Host);
      expect(trigger()).toHaveTextContent('Two');
      await open(user);
      expect(option('Two')).toHaveAttribute('aria-selected', 'true');
      await user.click(option('One'));
      expect(changed).toHaveBeenCalledTimes(1);
      expect(trigger()).toHaveTextContent('One');
    });

    it('keeps a value whose option is not rendered, with its label', async () => {
      await render(select('value="ghost"'), { imports });
      expect(trigger()).toHaveTextContent('ghost');
    });

    it('merges consumer classes onto the trigger and the options', async () => {
      const user = userEvent.setup();
      await render(
        `<volt-select aria-label="x" class="my-trigger">
           <volt-select-content>
             <volt-select-item value="a" class="my-item">A</volt-select-item>
           </volt-select-content>
         </volt-select>`,
        { imports }
      );
      expect(trigger()).toHaveClass('my-trigger', 'rounded-md');
      await open(user);
      expect(option('A')).toHaveClass('my-item', 'cursor-pointer');
    });

    it('removes the popup when the component is destroyed while open', async () => {
      const show = signal(true);
      const user = userEvent.setup();
      const { fixture } = await render(`@if (show()) {${select()}}`, {
        imports,
        componentProperties: { show },
      });
      await open(user);
      show.set(false);
      await fixture.whenStable();
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
    });

    describe('with Angular Forms', () => {
      it('writes the control value, reports user changes and follows setValue', async () => {
        const control = new FormControl<string | undefined>('angular', { nonNullable: true });
        const user = userEvent.setup();
        await render(select('[formControl]="control"'), {
          imports,
          componentProperties: { control },
        });
        expect(trigger()).toHaveTextContent('angular');
        await open(user);
        await user.click(option('Vue'));
        expect(control.value).toBe('vue');
        control.setValue('svelte');
        await waitFor(() => expect(trigger()).toHaveTextContent('svelte'));
      });

      it('does not echo a programmatic write back into the control', async () => {
        const control = new FormControl<string | null>(null);
        const spy = vi.fn();
        control.valueChanges.subscribe(spy);
        await render(select('[formControl]="control"'), {
          imports,
          componentProperties: { control },
        });
        control.setValue('vue');
        await waitFor(() => expect(trigger()).toHaveTextContent('vue'));
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('writes an array in multiple mode', async () => {
        const control = new FormControl<string[]>(['angular'], { nonNullable: true });
        const user = userEvent.setup();
        await render(select('multiple [formControl]="control"'), {
          imports,
          componentProperties: { control },
        });
        await open(user);
        await user.click(option('Vue'));
        expect(control.value).toEqual(['angular', 'vue']);
      });

      it('resets to the placeholder, disables and enables with the control', async () => {
        const control = new FormControl<string | null>('vue');
        await render(select('[formControl]="control"'), {
          imports,
          componentProperties: { control },
        });
        expect(trigger()).toHaveTextContent('vue');
        control.reset();
        await waitFor(() => expect(trigger()).toHaveTextContent('Pick one'));
        control.disable();
        await waitFor(() => expect(trigger()).toBeDisabled());
        control.enable();
        await waitFor(() => expect(trigger()).toBeEnabled());
      });

      it('marks the control touched when focus leaves the trigger and exposes the invalid state', async () => {
        const control = new FormControl<string | null>(null, Validators.required);
        const user = userEvent.setup();
        await render(select('[formControl]="control"'), {
          imports,
          componentProperties: { control },
        });
        expect(trigger()).not.toHaveAttribute('aria-invalid');
        await user.tab();
        await user.tab();
        expect(control.touched).toBe(true);
        await waitFor(() => expect(trigger()).toHaveAttribute('aria-invalid', 'true'));
      });

      it('works with ngModel', async () => {
        const user = userEvent.setup();
        @Component({
          selector: 'app-select-ngmodel-host',
          imports,
          template: select('[(ngModel)]="model"'),
        })
        class Host {
          model: string | undefined = 'angular';
        }
        const { fixture } = await render(Host);
        await fixture.whenStable();
        expect(trigger()).toHaveTextContent('angular');
        await open(user);
        await user.click(option('Vue'));
        expect(fixture.componentInstance.model).toBe('vue');
      });
    });
  });
}
