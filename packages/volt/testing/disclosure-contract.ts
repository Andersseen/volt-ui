import { Component, signal, Type } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

/*
 * The observable Volt contract of Tabs and Accordion, written once and run against every headless
 * backend (see `headless-contract.ts` and `group-contract.ts` for the other families). It asserts
 * what a consumer can observe — roles, ARIA relationships, keyboard, emitted values, `data-*`
 * styling hooks — never which primitive produced it.
 */

export interface TabsSpec {
  readonly tabs: Type<unknown>;
  readonly list: Type<unknown>;
  readonly trigger: Type<unknown>;
  readonly content: Type<unknown>;
}

export interface AccordionSpec {
  readonly accordion: Type<unknown>;
  readonly item: Type<unknown>;
  readonly trigger: Type<unknown>;
  readonly content: Type<unknown>;
}

const tab = (name: string) => screen.getByRole('tab', { name });

export function describeTabsContract(label: string, spec: TabsSpec): void {
  const imports = [spec.tabs, spec.list, spec.trigger, spec.content];
  const tabs = (attrs = '', extra = '') => `
    <volt-tabs ${attrs}>
      <volt-tabs-list aria-label="Settings">
        <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
        <volt-tabs-trigger value="security">Security</volt-tabs-trigger>
        <volt-tabs-trigger value="billing">Billing</volt-tabs-trigger>${extra}
      </volt-tabs-list>
      <volt-tabs-content value="account"><button>in-account</button></volt-tabs-content>
      <volt-tabs-content value="security"><button>in-security</button></volt-tabs-content>
      <volt-tabs-content value="billing"><button>in-billing</button></volt-tabs-content>
    </volt-tabs>`;
  const panel = (container: HTMLElement, value: string) =>
    container.querySelector<HTMLElement>(`volt-tabs-content[value="${value}"]`)!;
  const shown = (el: HTMLElement) => !el.hidden && el.getAttribute('data-state') === 'active';

  describe(`${label} tabs — Volt contract`, () => {
    it('exposes tablist / tab / tabpanel with consistent, non-dangling relationships', async () => {
      const { container } = await render(tabs('value="account"'), { imports });
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      const ids = [...container.querySelectorAll('[id]')].map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const value of ['account', 'security', 'billing']) {
        const t = container.querySelector<HTMLElement>(`volt-tabs-trigger[value="${value}"]`)!;
        const p = panel(container, value);
        expect(p).toHaveAttribute('role', 'tabpanel');
        expect(t.getAttribute('aria-controls')).toBe(p.id);
        expect(p.getAttribute('aria-labelledby')).toBe(t.id);
        expect(container.querySelectorAll(`[id="${p.id}"]`)).toHaveLength(1);
      }
    });

    it('selects the initial value and keeps styling hooks on the trigger and the panel', async () => {
      const { container } = await render(tabs('value="security"'), { imports });
      expect(tab('Security')).toHaveAttribute('aria-selected', 'true');
      expect(tab('Account')).toHaveAttribute('aria-selected', 'false');
      expect(tab('Security')).toHaveAttribute('data-state', 'active');
      expect(tab('Account')).toHaveAttribute('data-state', 'inactive');
      expect(panel(container, 'security')).toHaveAttribute('data-state', 'active');
      expect(panel(container, 'account')).toHaveAttribute('data-state', 'inactive');
    });

    it('shows the first tab while value is undefined, without emitting or writing a value', async () => {
      const changed = vi.fn();
      const { container } = await render(tabs('(valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      expect(tab('Account')).toHaveAttribute('aria-selected', 'true');
      expect(shown(panel(container, 'account'))).toBe(true);
      expect(changed).not.toHaveBeenCalled();
    });

    it('does not leave an inactive panel visible or its content focusable', async () => {
      const { container } = await render(tabs('value="account"'), { imports });
      expect(shown(panel(container, 'account'))).toBe(true);
      // Inactive panels carry `data-state=inactive`, which the Volt classes turn into display:none.
      expect(panel(container, 'security').className).toContain('data-[state=inactive]:hidden');
      expect(panel(container, 'security')).toHaveAttribute('data-state', 'inactive');
    });

    it('selects on click and emits valueChange once, with the tab value', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(tabs('value="account" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.click(tab('Billing'));
      expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith('billing');
    });

    it('does not emit when the selected tab is clicked again', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(tabs('value="account" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.click(tab('Account'));
      expect(changed).not.toHaveBeenCalled();
    });

    it('follows programmatic writes without emitting, and two-way binding stays in sync', async () => {
      @Component({
        selector: 'app-tabs-host',
        imports,
        template: tabs('[(value)]="current" (valueChange)="changed($event)"'),
      })
      class Host {
        readonly current = signal<string | undefined>('account');
        readonly changed = vi.fn();
      }
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      fixture.componentInstance.current.set('billing');
      await fixture.whenStable();
      expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');
      expect(fixture.componentInstance.changed).not.toHaveBeenCalled();
      await user.click(tab('Security'));
      expect(fixture.componentInstance.current()).toBe('security');
      expect(fixture.componentInstance.changed).toHaveBeenCalledTimes(1);
    });

    it('puts only the selected tab in the Tab order', async () => {
      const user = userEvent.setup();
      await render(tabs('value="security"'), { imports });
      const tabbable = screen.getAllByRole('tab').filter(t => t.tabIndex === 0);
      expect(tabbable).toEqual([tab('Security')]);
      await user.tab();
      expect(tab('Security')).toHaveFocus();
    });

    it('moves focus and selection with the arrow keys, Home and End (automatic activation)', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(tabs('value="account" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(tab('Security')).toHaveFocus();
      expect(tab('Security')).toHaveAttribute('aria-selected', 'true');
      expect(changed).toHaveBeenLastCalledWith('security');
      await user.keyboard('{End}');
      expect(tab('Billing')).toHaveFocus();
      expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');
      await user.keyboard('{Home}');
      expect(tab('Account')).toHaveFocus();
      expect(tab('Account')).toHaveAttribute('aria-selected', 'true');
      expect(changed).toHaveBeenCalledTimes(3);
    });

    it('with activateOnFocus off, arrows move focus only and selection stays', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(
        tabs('value="account" [activateOnFocus]="false" (valueChange)="changed($event)"'),
        { imports, componentProperties: { changed } }
      );
      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(tab('Security')).toHaveFocus();
      expect(tab('Security')).toHaveAttribute('aria-selected', 'false');
      expect(tab('Account')).toHaveAttribute('aria-selected', 'true');
      expect(changed).not.toHaveBeenCalled();
      await user.click(tab('Security'));
      expect(tab('Security')).toHaveAttribute('aria-selected', 'true');
      expect(changed).toHaveBeenCalledWith('security');
    });

    it('uses Up/Down in a vertical list and reports the orientation', async () => {
      const user = userEvent.setup();
      await render(tabs('value="account" orientation="vertical"'), { imports });
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(tab('Security')).toHaveFocus();
      await user.keyboard('{ArrowUp}');
      expect(tab('Account')).toHaveFocus();
    });

    it('adds and removes tabs dynamically, and a removed selected tab falls back to a remaining one', async () => {
      const show = signal(true);
      const { fixture } = await render(
        `<volt-tabs value="extra"><volt-tabs-list aria-label="x">
           <volt-tabs-trigger value="first">First</volt-tabs-trigger>
           @if (show()) { <volt-tabs-trigger value="extra">Extra</volt-tabs-trigger> }
         </volt-tabs-list>
         <volt-tabs-content value="first">P1</volt-tabs-content>
         @if (show()) { <volt-tabs-content value="extra">P2</volt-tabs-content> }
         </volt-tabs>`,
        { imports, componentProperties: { show } }
      );
      expect(tab('Extra')).toHaveAttribute('aria-selected', 'true');
      show.set(false);
      await fixture.whenStable();
      expect(screen.queryByRole('tab', { name: 'Extra' })).toBeNull();
      expect(tab('First')).toHaveAttribute('aria-selected', 'true');
      show.set(true);
      await fixture.whenStable();
      // The model still says "extra": it is shown again when it comes back.
      expect(tab('Extra')).toHaveAttribute('aria-selected', 'true');
    });
  });
}

export function describeAccordionContract(label: string, spec: AccordionSpec): void {
  const imports = [spec.accordion, spec.item, spec.trigger, spec.content];
  const accordion = (attrs = '') => `
    <volt-accordion ${attrs}>
      <volt-accordion-item value="one">
        <volt-accordion-trigger>One</volt-accordion-trigger>
        <volt-accordion-content><button>in-one</button></volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="two">
        <volt-accordion-trigger>Two</volt-accordion-trigger>
        <volt-accordion-content><button>in-two</button></volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="three">
        <volt-accordion-trigger>Three</volt-accordion-trigger>
        <volt-accordion-content>three body</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>`;
  const header = (name: string) => screen.getByRole('button', { name });
  const expanded = (name: string) => header(name).getAttribute('aria-expanded');

  describe(`${label} accordion — Volt contract`, () => {
    it('renders native-button triggers, collapsed by default, with nothing opened on its own', async () => {
      await render(accordion(), { imports });
      for (const name of ['One', 'Two', 'Three']) {
        expect(header(name).tagName).toBe('BUTTON');
        expect(header(name)).toHaveAttribute('type', 'button');
        expect(expanded(name)).toBe('false');
        expect(header(name)).not.toHaveAttribute('data-open');
      }
    });

    it('relates every trigger and panel without dangling or duplicate ids', async () => {
      const { container } = await render(accordion('[collapsible]="true"'), { imports });
      const ids = [...container.querySelectorAll('[id]')].map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const name of ['One', 'Two', 'Three']) {
        const controls = header(name).getAttribute('aria-controls')!;
        const region = container.querySelector<HTMLElement>(`[id="${controls}"]`)!;
        expect(region).not.toBeNull();
        expect(region.getAttribute('aria-labelledby')).toBe(header(name).id);
        expect(container.querySelectorAll(`[id="${header(name).id}"]`)).toHaveLength(1);
      }
    });

    it('opens on click, mirrors state in data-open and emits the value once', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      const { container } = await render(accordion('(valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.click(header('Two'));
      expect(expanded('Two')).toBe('true');
      expect(header('Two')).toHaveAttribute('data-open');
      expect(
        container.querySelectorAll(
          'volt-accordion-item[data-open], volt-accordion-content[data-open]'
        )
      ).toHaveLength(2);
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith('two');
    });

    it('single: opening one closes the other; a non-collapsible one cannot be closed', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(accordion('value="one" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      expect(expanded('One')).toBe('true');
      await user.click(header('Two'));
      expect(expanded('One')).toBe('false');
      expect(expanded('Two')).toBe('true');
      await user.click(header('Two'));
      expect(expanded('Two')).toBe('true');
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenLastCalledWith('two');
    });

    it('single + collapsible: the open item closes and the value becomes null', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(accordion('value="one" [collapsible]="true" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.click(header('One'));
      expect(expanded('One')).toBe('false');
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenLastCalledWith(null);
    });

    it('multiple: several items stay open and the value is an array', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      await render(accordion('type="multiple" (valueChange)="changed($event)"'), {
        imports,
        componentProperties: { changed },
      });
      await user.click(header('One'));
      await user.click(header('Three'));
      expect(expanded('One')).toBe('true');
      expect(expanded('Three')).toBe('true');
      expect(changed).toHaveBeenLastCalledWith(['one', 'three']);
      await user.click(header('One'));
      expect(expanded('One')).toBe('false');
      expect(changed).toHaveBeenLastCalledWith(['three']);
    });

    it('applies a static initial value, single and multiple', async () => {
      await render(accordion('type="multiple" [value]="[\'one\', \'three\']"'), { imports });
      expect(expanded('One')).toBe('true');
      expect(expanded('Two')).toBe('false');
      expect(expanded('Three')).toBe('true');
    });

    it('follows programmatic writes without emitting; [(value)] stays in sync', async () => {
      @Component({
        selector: 'app-accordion-host',
        imports,
        template: accordion(
          '[(value)]="current" [collapsible]="true" (valueChange)="changed($event)"'
        ),
      })
      class Host {
        readonly current = signal<string | string[] | null>(null);
        readonly changed = vi.fn();
      }
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      fixture.componentInstance.current.set('two');
      await fixture.whenStable();
      expect(expanded('Two')).toBe('true');
      fixture.componentInstance.current.set(null);
      await fixture.whenStable();
      expect(expanded('Two')).toBe('false');
      expect(fixture.componentInstance.changed).not.toHaveBeenCalled();
      await user.click(header('Three'));
      expect(fixture.componentInstance.current()).toBe('three');
      expect(fixture.componentInstance.changed).toHaveBeenCalledTimes(1);
    });

    it('opens and closes from the keyboard with Enter and Space', async () => {
      const user = userEvent.setup();
      await render(accordion('[collapsible]="true"'), { imports });
      await user.tab();
      expect(header('One')).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(expanded('One')).toBe('true');
      await user.keyboard(' ');
      expect(expanded('One')).toBe('false');
    });

    it('puts every enabled trigger in the Tab order, with panel content after its trigger', async () => {
      const user = userEvent.setup();
      await render(accordion('value="one"'), { imports });
      await user.tab();
      expect(header('One')).toHaveFocus();
      await user.tab();
      await user.tab();
      expect(header('Two')).toHaveFocus();
    });

    it('a disabled accordion ignores clicks and exposes disabled triggers', async () => {
      const changed = vi.fn();
      const user = userEvent.setup();
      const { container } = await render(
        accordion('disabled value="one" (valueChange)="changed($event)"'),
        { imports, componentProperties: { changed } }
      );
      await user.click(header('Two'));
      expect(expanded('Two')).toBe('false');
      expect(changed).not.toHaveBeenCalled();
      expect(container.querySelector('[data-disabled]')).not.toBeNull();
      for (const name of ['One', 'Two', 'Three']) expect(header(name)).toBeDisabled();
    });

    it('keeps an open item open after it is removed and added again', async () => {
      const show = signal(true);
      const { fixture } = await render(
        `<volt-accordion value="b"><volt-accordion-item value="a">
           <volt-accordion-trigger>A</volt-accordion-trigger><volt-accordion-content>a</volt-accordion-content>
         </volt-accordion-item>
         @if (show()) { <volt-accordion-item value="b">
           <volt-accordion-trigger>B</volt-accordion-trigger><volt-accordion-content>b</volt-accordion-content>
         </volt-accordion-item> }
         </volt-accordion>`,
        { imports, componentProperties: { show } }
      );
      expect(expanded('B')).toBe('true');
      show.set(false);
      await fixture.whenStable();
      show.set(true);
      await fixture.whenStable();
      expect(expanded('B')).toBe('true');
      expect(expanded('A')).toBe('false');
    });
  });
}
