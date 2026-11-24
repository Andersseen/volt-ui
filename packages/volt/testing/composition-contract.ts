import { signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { TabsSpec } from './disclosure-contract';
import type { RadioGroupSpec, ToggleGroupSpec } from './group-contract';

/*
 * Focus ownership across nested composites, run against every headless backend. Each composite
 * owns the arrow keys of its own items: a toggle group or radio group in a tab panel keeps its own
 * tab stop and never moves or switches the outer tab, the tab list keeps its own, and a tabset
 * nested in another panel is independent. Asserted on what a user observes: DOM focus, tabindex,
 * ARIA state and emitted values.
 */

export interface CompositionSpec {
  readonly tabs: TabsSpec;
  readonly toggle: ToggleGroupSpec;
  readonly radio: RadioGroupSpec;
}

const tab = (name: string) => screen.getByRole('tab', { name });
const radio = (name: string) => screen.getByRole('radio', { name });
const focused = () => document.activeElement;

export function describeNestedCompositionContract(label: string, spec: CompositionSpec): void {
  const imports = [
    spec.tabs.tabs,
    spec.tabs.list,
    spec.tabs.trigger,
    spec.tabs.content,
    spec.toggle.group,
    spec.toggle.item,
    spec.radio.group,
    spec.radio.item,
    ReactiveFormsModule,
  ];

  const gallery = (groupAttrs = '', extra = '') => `
    <volt-tabs [(value)]="tab" [orientation]="tabsOrientation()">
      <volt-tabs-list>
        <volt-tabs-trigger value="photos">Photos</volt-tabs-trigger>
        <volt-tabs-trigger value="videos">Videos</volt-tabs-trigger>
        <volt-tabs-trigger value="files">Files</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="photos">
        <volt-toggle-group aria-label="Thumbnail" [(value)]="thumb" ${groupAttrs}>
          <volt-toggle-group-item value="one">One</volt-toggle-group-item>
          <volt-toggle-group-item value="two" [disabled]="twoDisabled()">Two</volt-toggle-group-item>
          <volt-toggle-group-item value="three">Three</volt-toggle-group-item>
        </volt-toggle-group>
        ${extra}
      </volt-tabs-content>
      <volt-tabs-content value="videos">Videos panel</volt-tabs-content>
      <volt-tabs-content value="files">Files panel</volt-tabs-content>
    </volt-tabs>
    <button type="button">After</button>`;

  const state = () => ({
    tab: signal('photos'),
    thumb: signal<string[]>([]),
    size: signal<string[]>(['l']),
    tabsOrientation: signal<'horizontal' | 'vertical'>('horizontal'),
    twoDisabled: signal(false),
    second: signal(false),
  });

  describe(`${label} nested composites — focus ownership`, () => {
    it('ToggleGroup in a tab panel: its own tab stop next to the active tab', async () => {
      const props = state();
      await render(gallery(), { imports, componentProperties: props });
      expect(tab('Photos')).toHaveAttribute('tabindex', '0');
      expect(radio('One')).toHaveAttribute('tabindex', '0');
      expect(radio('Two')).toHaveAttribute('tabindex', '-1');
    });

    it('Tab enters the active tab, then the group; Shift+Tab walks back', async () => {
      const user = userEvent.setup();
      await render(gallery(), { imports, componentProperties: state() });
      await user.tab();
      expect(focused()).toBe(tab('Photos'));
      // The tab panel may itself be a tab stop (ng-primitives), so walk until we leave the list.
      for (let i = 0; i < 2 && focused() !== radio('One'); i++) await user.tab();
      expect(focused()).toBe(radio('One'));
      await user.tab();
      expect(focused()).toBe(screen.getByRole('button', { name: 'After' }));
      await user.tab({ shift: true });
      expect(focused()).toBe(radio('One'));
      for (let i = 0; i < 2 && focused() !== tab('Photos'); i++) await user.tab({ shift: true });
      expect(focused()).toBe(tab('Photos'));
    });

    it('arrows move only within the group, wrap inside it, and never switch the tab', async () => {
      const user = userEvent.setup();
      const props = state();
      await render(gallery(), { imports, componentProperties: props });
      await user.click(radio('One'));
      expect(props.thumb()).toEqual(['one']);
      for (const [key, name] of [
        ['{ArrowRight}', 'Two'],
        ['{ArrowRight}', 'Three'],
        ['{ArrowRight}', 'One'],
        ['{ArrowLeft}', 'Three'],
        ['{Home}', 'One'],
        ['{End}', 'Three'],
      ] as const) {
        await user.keyboard(key);
        expect(focused(), `${key} → ${name}`).toBe(radio(name));
      }
      expect(props.tab()).toBe('photos');
      expect(tab('Photos')).toHaveAttribute('aria-selected', 'true');
      // A single toggle group moves focus on arrows; it does not select.
      expect(props.thumb()).toEqual(['one']);
    });

    it('arrows in the tab list still move between the tabs only', async () => {
      const user = userEvent.setup();
      const props = state();
      await render(gallery(), { imports, componentProperties: props });
      await user.click(tab('Photos'));
      await user.keyboard('{ArrowRight}');
      expect(focused()).toBe(tab('Videos'));
      await user.keyboard('{ArrowRight}{ArrowRight}');
      expect(focused()).toBe(tab('Photos'));
      expect(props.thumb()).toEqual([]);
    });

    it('Space and Enter select the focused item and leave the outer tab alone', async () => {
      const user = userEvent.setup();
      const props = state();
      await render(gallery(), { imports, componentProperties: props });
      await user.click(radio('One'));
      await user.keyboard('{ArrowRight}{ArrowRight} ');
      expect(props.thumb()).toEqual(['three']);
      await user.keyboard('{ArrowRight}{Enter}');
      expect(props.thumb()).toEqual(['one']);
      expect(props.tab()).toBe('photos');
    });

    it('the selected item is the tab stop, and follows a programmatic selection', async () => {
      const props = state();
      const { fixture } = await render(gallery(), { imports, componentProperties: props });
      props.thumb.set(['three']);
      await fixture.whenStable();
      expect(radio('Three')).toHaveAttribute('tabindex', '0');
      expect(radio('One')).toHaveAttribute('tabindex', '-1');
      expect(tab('Photos')).toHaveAttribute('tabindex', '0');
      expect(focused()).toBe(document.body);
    });

    it('skips a disabled item, and honours a vertical group in a vertical tabset', async () => {
      const user = userEvent.setup();
      const props = state();
      props.twoDisabled.set(true);
      props.tabsOrientation.set('vertical');
      await render(gallery('orientation="vertical"'), { imports, componentProperties: props });
      await user.click(radio('One'));
      await user.keyboard('{ArrowDown}');
      expect(focused()).toBe(radio('Three'));
      await user.keyboard('{ArrowUp}');
      expect(focused()).toBe(radio('One'));
      await user.click(tab('Photos'));
      await user.keyboard('{ArrowDown}');
      expect(focused()).toBe(tab('Videos'));
    });

    it('multiple mode: arrows move between the toggle buttons inside the panel', async () => {
      const user = userEvent.setup();
      const props = state();
      await render(gallery('type="multiple"'), { imports, componentProperties: props });
      await user.click(screen.getByRole('button', { name: 'One' }));
      await user.keyboard('{ArrowRight}{ArrowRight} ');
      expect(props.thumb()).toEqual(['one', 'three']);
      expect(props.tab()).toBe('photos');
    });

    it('two groups in one panel stay independent, including one mounted later', async () => {
      const user = userEvent.setup();
      const props = state();
      const second = `@if (second()) {
          <volt-toggle-group aria-label="Size" [(value)]="size">
            <volt-toggle-group-item value="s">Small</volt-toggle-group-item>
            <volt-toggle-group-item value="l">Large</volt-toggle-group-item>
          </volt-toggle-group>
        }`;
      const { fixture } = await render(gallery('', second), {
        imports,
        componentProperties: props,
      });
      props.second.set(true);
      await fixture.whenStable();
      expect(radio('Large')).toHaveAttribute('tabindex', '0');
      expect(radio('One')).toHaveAttribute('tabindex', '0');

      await user.click(radio('Three'));
      await user.keyboard('{ArrowRight}');
      expect(focused()).toBe(radio('One'));
      await user.click(radio('Small'));
      await user.keyboard('{ArrowRight}');
      expect(focused()).toBe(radio('Large'));

      props.second.set(false);
      await fixture.whenStable();
      expect(screen.queryByRole('radio', { name: 'Large' })).toBeNull();
      await user.click(radio('Three'));
      await user.keyboard('{ArrowRight}');
      expect(focused()).toBe(radio('One'));
      expect(props.tab()).toBe('photos');
    });

    it('RadioGroup in a tab panel: owns its arrows, selects on arrow, Forms in step', async () => {
      const user = userEvent.setup();
      const plan = new FormControl<string | null>('pro');
      const { fixture } = await render(
        `<volt-tabs value="plan">
          <volt-tabs-list>
            <volt-tabs-trigger value="plan">Plan</volt-tabs-trigger>
            <volt-tabs-trigger value="billing">Billing</volt-tabs-trigger>
          </volt-tabs-list>
          <volt-tabs-content value="plan">
            <volt-radio-group aria-label="Plan" [formControl]="plan">
              <volt-radio-item value="free">Free</volt-radio-item>
              <volt-radio-item value="pro">Pro</volt-radio-item>
              <volt-radio-item value="team">Team</volt-radio-item>
            </volt-radio-group>
          </volt-tabs-content>
          <volt-tabs-content value="billing">Billing panel</volt-tabs-content>
        </volt-tabs>`,
        { imports, componentProperties: { plan } }
      );
      expect(radio('Pro')).toHaveAttribute('tabindex', '0');
      expect(tab('Plan')).toHaveAttribute('tabindex', '0');
      expect(plan.touched).toBe(false);

      await user.click(radio('Pro'));
      await user.keyboard('{ArrowDown}');
      expect(focused()).toBe(radio('Team'));
      expect(plan.value).toBe('team');
      await user.keyboard('{ArrowDown}');
      expect(focused()).toBe(radio('Free'));
      expect(plan.value).toBe('free');
      expect(tab('Plan')).toHaveAttribute('aria-selected', 'true');

      (focused() as HTMLElement).blur();
      plan.setValue('team'); // a Forms write checks the radio and moves the tab stop, not focus
      await fixture.whenStable();
      expect(radio('Team')).toHaveAttribute('aria-checked', 'true');
      expect(radio('Team')).toHaveAttribute('tabindex', '0');
      expect(focused()).toBe(document.body);
    });

    it('Tabs in a tab panel: each tab list owns its arrows and its tab stop', async () => {
      const user = userEvent.setup();
      const outer = signal('a');
      const inner = signal('x');
      await render(
        `<volt-tabs [(value)]="outer">
          <volt-tabs-list aria-label="Outer">
            <volt-tabs-trigger value="a">Outer A</volt-tabs-trigger>
            <volt-tabs-trigger value="b">Outer B</volt-tabs-trigger>
          </volt-tabs-list>
          <volt-tabs-content value="a">
            <volt-tabs [(value)]="inner">
              <volt-tabs-list aria-label="Inner">
                <volt-tabs-trigger value="x">Inner X</volt-tabs-trigger>
                <volt-tabs-trigger value="y">Inner Y</volt-tabs-trigger>
              </volt-tabs-list>
              <volt-tabs-content value="x">X panel</volt-tabs-content>
              <volt-tabs-content value="y">Y panel</volt-tabs-content>
            </volt-tabs>
          </volt-tabs-content>
          <volt-tabs-content value="b">B panel</volt-tabs-content>
        </volt-tabs>`,
        { imports, componentProperties: { outer, inner } }
      );
      expect(tab('Outer A')).toHaveAttribute('tabindex', '0');
      expect(tab('Inner X')).toHaveAttribute('tabindex', '0');
      // The inner tabset's panels must not take over the panel they sit in.
      const panel = (value: string) =>
        document.querySelector(`volt-tabs-content[value="${value}"]`);
      expect(panel('a')).toHaveAttribute('data-state', 'active');
      expect(panel('x')).toHaveAttribute('data-state', 'active');
      expect(panel('y')).toHaveAttribute('data-state', 'inactive');
      expect(panel('b')).toHaveAttribute('data-state', 'inactive');

      await user.click(tab('Inner X'));
      await user.keyboard('{ArrowRight}');
      expect(focused()).toBe(tab('Inner Y'));
      expect(inner()).toBe('y');
      expect(outer()).toBe('a');
      await user.keyboard('{ArrowRight}');
      expect(focused()).toBe(tab('Inner X'));

      await user.click(tab('Outer A'));
      await user.keyboard('{ArrowRight}');
      expect(focused()).toBe(tab('Outer B'));
      expect(outer()).toBe('b');
      expect(inner()).toBe('x');
    });
  });
}
