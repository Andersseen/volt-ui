import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltTextarea } from 'volt';
import { TEXTAREA_API } from '../../src/app/lib/api-reference.generated';
import { variantArgTypes } from '../_helpers/api';

const meta: Meta<VoltTextarea> = {
  title: 'Components/Forms & Inputs/Textarea',
  component: VoltTextarea,
  decorators: [moduleMetadata({ imports: [VoltTextarea] })],
  argTypes: {
    ...variantArgTypes(TEXTAREA_API),
    resize: { control: 'radio', options: ['none', 'vertical', 'horizontal', 'both'] },
    rows: { control: 'number' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  args: {
    variant: 'default',
    size: 'md',
    state: 'default',
    resize: 'vertical',
    rows: 3,
    placeholder: 'Write a message…',
    disabled: false,
    readonly: false,
  },
  render: args => ({
    props: args,
    template: `<volt-textarea class="max-w-md" aria-label="Message" [variant]="variant" [size]="size" [state]="state" [resize]="resize" [rows]="rows" [placeholder]="placeholder" [disabled]="disabled" [readonly]="readonly" />`,
  }),
};
export default meta;
type Story = StoryObj<VoltTextarea>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-md flex-col gap-3">
        <volt-textarea variant="default" placeholder="Default" aria-label="Default" />
        <volt-textarea variant="filled" placeholder="Filled" aria-label="Filled" />
        <volt-textarea variant="ghost" placeholder="Ghost" aria-label="Ghost" />
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-md flex-col gap-3">
        <volt-textarea state="success" value="Looks good" aria-label="Success" />
        <volt-textarea state="error" value="Too short" aria-label="Error" />
        <volt-textarea disabled placeholder="Disabled" aria-label="Disabled" />
      </div>`,
  }),
};
