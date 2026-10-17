import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltAutofill } from 'volt';

const meta: Meta<VoltAutofill> = {
  title: 'Components/Forms & Inputs/Autofill',
  component: VoltAutofill,
  decorators: [moduleMetadata({ imports: [VoltAutofill] })],
  argTypes: { autofillChange: { action: 'autofillChange' } },
  render: args => ({
    props: args,
    template: `
      <input voltAutofill type="email" autocomplete="email" aria-label="Email"
        class="border-input bg-background h-10 w-72 rounded-md border px-3 text-sm"
        placeholder="Email address" (autofillChange)="autofillChange($event)" />
      <p class="text-muted-foreground mt-2 text-sm">Let your browser autofill this field to see <code>autofillChange</code> in the Actions panel.</p>`,
  }),
};
export default meta;
type Story = StoryObj<VoltAutofill>;

export const Default: Story = {};
