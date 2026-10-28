import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltButton, VoltNativeButton, VoltSpinner } from 'volt';
import { BUTTON_API } from '../../apps/web/src/app/lib/api-reference.generated';
import { variantArgTypes } from '../_helpers/api';

const meta: Meta<VoltButton> = {
  title: 'Components/Forms & Inputs/Button',
  component: VoltButton,
  decorators: [moduleMetadata({ imports: [VoltButton, VoltNativeButton, VoltSpinner] })],
  argTypes: {
    ...variantArgTypes(BUTTON_API),
    type: { control: 'radio', options: ['button', 'submit', 'reset'] },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'solid', size: 'md', type: 'button', disabled: false },
  render: args => ({
    props: args,
    template: `<volt-button [variant]="variant" [size]="size" [type]="type" [disabled]="disabled">Save changes</volt-button>`,
  }),
};
export default meta;
type Story = StoryObj<VoltButton>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Five variants cover primary, secondary, quiet, inline and destructive actions.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <volt-button variant="solid">Solid</volt-button>
        <volt-button variant="outline">Outline</volt-button>
        <volt-button variant="ghost">Ghost</volt-button>
        <volt-button variant="link">Link</volt-button>
        <volt-button variant="destructive">Destructive</volt-button>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <volt-button size="sm">Small</volt-button>
        <volt-button size="md">Medium</volt-button>
        <volt-button size="lg">Large</volt-button>
        <volt-button size="icon" aria-label="Add">+</volt-button>
      </div>`,
  }),
};

export const NativeElement: Story = {
  name: 'Native <button> and <a>',
  parameters: {
    docs: {
      description: {
        story:
          'The `voltButton` attribute styles the element you wrote, so a link stays a real link and a button stays a real button.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <button voltButton type="submit">Submit</button>
        <a voltButton variant="outline" href="https://voltui.dev" target="_blank" rel="noopener">Documentation</a>
      </div>`,
  }),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` removes the button from the tab order; `aria-disabled="true"` dims it but keeps it focusable so it can explain itself with `aria-describedby`.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <button voltButton type="button" disabled>Disabled</button>
        <button voltButton variant="destructive" type="button" aria-disabled="true" aria-describedby="why">Delete</button>
        <span id="why" class="text-sm text-muted-foreground">The last administrator cannot be deleted.</span>
      </div>`,
  }),
};

export const Pending: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'While work runs, the spinner is decorative because the text already says what is happening.',
      },
    },
  },
  render: () => ({
    template: `
      <button voltButton type="button" aria-disabled="true">
        <volt-spinner size="sm" />
        Saving…
      </button>`,
  }),
};
