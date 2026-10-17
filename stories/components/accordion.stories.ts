import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltAccordion, VoltAccordionContent, VoltAccordionItem, VoltAccordionTrigger } from 'volt';

const meta: Meta<VoltAccordion> = {
  title: 'Components/Display/Accordion',
  component: VoltAccordion,
  decorators: [
    moduleMetadata({
      imports: [VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent],
    }),
  ],
  argTypes: {
    type: { control: 'radio', options: ['single', 'multiple'] },
    collapsible: { control: 'boolean' },
    disabled: { control: 'boolean' },
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    valueChange: { action: 'valueChange' },
  },
  args: { type: 'single', collapsible: true, disabled: false, orientation: 'vertical' },
  render: args => ({
    props: args,
    template: `
      <volt-accordion class="block max-w-md" [type]="type" [collapsible]="collapsible" [disabled]="disabled" [orientation]="orientation" (valueChange)="valueChange($event)">
        <volt-accordion-item value="item-1">
          <volt-accordion-trigger>Is it accessible?</volt-accordion-trigger>
          <volt-accordion-content>Yes. It follows the WAI-ARIA accordion pattern through ng-primitives.</volt-accordion-content>
        </volt-accordion-item>
        <volt-accordion-item value="item-2">
          <volt-accordion-trigger>Is it styled?</volt-accordion-trigger>
          <volt-accordion-content>Yes. It uses the active Volt theme.</volt-accordion-content>
        </volt-accordion-item>
        <volt-accordion-item value="item-3">
          <volt-accordion-trigger>Can several be open?</volt-accordion-trigger>
          <volt-accordion-content>Set <code>type="multiple"</code>.</volt-accordion-content>
        </volt-accordion-item>
      </volt-accordion>`,
  }),
};
export default meta;
type Story = StoryObj<VoltAccordion>;

export const Default: Story = {};

export const Multiple: Story = {
  args: { type: 'multiple' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
