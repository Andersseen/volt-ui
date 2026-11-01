import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltCheckbox,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSwitch,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltToggle,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';
import {
  VoltAccordion as QuartzAccordion,
  VoltAccordionContent as QuartzAccordionContent,
  VoltAccordionItem as QuartzAccordionItem,
  VoltAccordionTrigger as QuartzAccordionTrigger,
  VoltCheckbox as QuartzCheckbox,
  VoltRadioGroup as QuartzRadioGroup,
  VoltRadioItem as QuartzRadioItem,
  VoltSwitch as QuartzSwitch,
  VoltTabs as QuartzTabs,
  VoltTabsContent as QuartzTabsContent,
  VoltTabsList as QuartzTabsList,
  VoltTabsTrigger as QuartzTabsTrigger,
  VoltToggle as QuartzToggle,
  VoltToggleGroup as QuartzToggleGroup,
  VoltToggleGroupItem as QuartzToggleGroupItem,
} from 'volt/quartz';

/*
 * One Angular component may import only ONE implementation of a selector, so each backend gets its
 * own wrapper with the same template. Wrappers are independent components; putting them side by
 * side is allowed, importing both `VoltCheckbox` classes into one `imports` array is not.
 */
const TEMPLATE = `
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2"><volt-checkbox ariaLabel="Checked" [checked]="true" /><span class="text-sm">Checked</span></div>
    <div class="flex items-center gap-2"><volt-checkbox ariaLabel="Unchecked" /><span class="text-sm">Unchecked</span></div>
    <div class="flex items-center gap-2"><volt-checkbox ariaLabel="Indeterminate" [indeterminate]="true" /><span class="text-sm">Indeterminate</span></div>
    <div class="flex items-center gap-2"><volt-checkbox ariaLabel="Disabled" [disabled]="true" /><span class="text-sm">Disabled</span></div>
    <div class="flex items-center gap-2"><volt-switch ariaLabel="On" [checked]="true" /><span class="text-sm">Switch on</span></div>
    <div class="flex items-center gap-2"><volt-switch ariaLabel="Off" /><span class="text-sm">Switch off</span></div>
    <div class="flex items-center gap-2"><volt-switch ariaLabel="Forms" [formControl]="value" /><span class="text-sm">Switch in a form: {{ value.value }}</span></div>
    <div class="flex items-center gap-2">
      <volt-toggle ariaLabel="Pressed" [pressed]="true" variant="outline">Pressed</volt-toggle>
      <volt-toggle ariaLabel="Unpressed" variant="outline">Unpressed</volt-toggle>
      <volt-toggle ariaLabel="Disabled toggle" [disabled]="true" variant="outline">Disabled</volt-toggle>
    </div>
    <volt-radio-group aria-label="Fruit" orientation="horizontal" value="pear">
      <volt-radio-item value="apple">Apple</volt-radio-item>
      <volt-radio-item value="pear">Pear</volt-radio-item>
      <volt-radio-item value="plum" disabled>Plum</volt-radio-item>
    </volt-radio-group>
    <volt-toggle-group aria-label="Format" type="multiple" [value]="['bold']">
      <volt-toggle-group-item value="bold" variant="outline">Bold</volt-toggle-group-item>
      <volt-toggle-group-item value="italic" variant="outline">Italic</volt-toggle-group-item>
      <volt-toggle-group-item value="underline" variant="outline" disabled>Underline</volt-toggle-group-item>
    </volt-toggle-group>
    <volt-toggle-group aria-label="Alignment" [value]="['left']">
      <volt-toggle-group-item value="left">Left</volt-toggle-group-item>
      <volt-toggle-group-item value="right">Right</volt-toggle-group-item>
    </volt-toggle-group>
    <volt-tabs value="account">
      <volt-tabs-list aria-label="Settings">
        <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
        <volt-tabs-trigger value="security">Security</volt-tabs-trigger>
        <volt-tabs-trigger value="billing">Billing</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="account">Account settings</volt-tabs-content>
      <volt-tabs-content value="security">Security settings</volt-tabs-content>
      <volt-tabs-content value="billing">Billing settings</volt-tabs-content>
    </volt-tabs>
    <volt-accordion value="shipping" [collapsible]="true">
      <volt-accordion-item value="shipping">
        <volt-accordion-trigger>Shipping</volt-accordion-trigger>
        <volt-accordion-content>Ships in two days.</volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="returns">
        <volt-accordion-trigger>Returns</volt-accordion-trigger>
        <volt-accordion-content>Thirty days to return.</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>
  </div>`;

@Component({
  selector: 'app-ngp-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCheckbox,
    VoltSwitch,
    VoltToggle,
    VoltRadioGroup,
    VoltRadioItem,
    VoltToggleGroup,
    VoltToggleGroupItem,
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
    ReactiveFormsModule,
  ],
  template: TEMPLATE,
})
class NgPrimitivesControls {
  readonly value = new FormControl(true, { nonNullable: true });
}

@Component({
  selector: 'app-quartz-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    QuartzCheckbox,
    QuartzSwitch,
    QuartzToggle,
    QuartzRadioGroup,
    QuartzRadioItem,
    QuartzToggleGroup,
    QuartzToggleGroupItem,
    QuartzTabs,
    QuartzTabsList,
    QuartzTabsTrigger,
    QuartzTabsContent,
    QuartzAccordion,
    QuartzAccordionItem,
    QuartzAccordionTrigger,
    QuartzAccordionContent,
    ReactiveFormsModule,
  ],
  template: TEMPLATE,
})
class QuartzControls {
  readonly value = new FormControl(true, { nonNullable: true });
}

const meta: Meta = {
  title: 'Foundations/Headless backends',
  decorators: [moduleMetadata({ imports: [NgPrimitivesControls, QuartzControls] })],
  parameters: {
    docs: {
      description: {
        component:
          'Checkbox, Radio, Switch, Toggle, ToggleGroup, Tabs and Accordion rendered by both headless backends from the same template. ' +
          'The Quartz column imports from `@voltui/components/quartz` (experimental, opt-in); the other is the default ng-primitives implementation. ' +
          'Colour and style presets apply to both; switch them in the toolbar.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const NgPrimitives: Story = {
  name: 'ng-primitives (default)',
  render: () => ({ template: `<app-ngp-controls />` }),
};

export const Quartz: Story = {
  name: 'Quartz Headless (experimental)',
  render: () => ({ template: `<app-quartz-controls />` }),
};

export const SideBySide: Story = {
  name: 'Side by side',
  render: () => ({
    template: `
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section aria-label="ng-primitives"><h3 class="mb-3 text-sm font-medium">ng-primitives</h3><app-ngp-controls /></section>
        <section aria-label="Quartz Headless"><h3 class="mb-3 text-sm font-medium">Quartz Headless</h3><app-quartz-controls /></section>
      </div>`,
  }),
};
