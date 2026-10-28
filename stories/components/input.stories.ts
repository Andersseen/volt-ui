import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoltFormField, VoltHint, VoltError, VoltInput, VoltLabel } from 'volt';
import { INPUT_API } from '../../apps/web/src/app/lib/api-reference.generated';
import { variantArgTypes } from '../_helpers/api';

const meta: Meta<VoltInput> = {
  title: 'Components/Forms & Inputs/Input',
  component: VoltInput,
  decorators: [
    moduleMetadata({
      imports: [VoltInput, VoltFormField, VoltLabel, VoltHint, VoltError, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    ...variantArgTypes(INPUT_API),
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    type: 'text',
    placeholder: 'Email address',
    size: 'md',
    state: 'default',
    disabled: false,
    readonly: false,
  },
  render: args => ({
    props: args,
    template: `<volt-input aria-label="Email" [type]="type" [placeholder]="placeholder" [size]="size" [state]="state" [disabled]="disabled" [readonly]="readonly" [required]="required" />`,
  }),
};
export default meta;
type Story = StoryObj<VoltInput>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-sm flex-col gap-3">
        <volt-input size="sm" placeholder="Small" aria-label="Small" />
        <volt-input size="md" placeholder="Medium" aria-label="Medium" />
        <volt-input size="lg" placeholder="Large" aria-label="Large" />
      </div>`,
  }),
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `error` and `success` states change the border and colour; pair them with visible text, as in the validation example below.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex max-w-sm flex-col gap-3">
        <volt-input state="default" placeholder="Default" aria-label="Default" />
        <volt-input state="success" value="volt" aria-label="Success" />
        <volt-input state="error" value="not an email" aria-label="Error" />
        <volt-input disabled placeholder="Disabled" aria-label="Disabled" />
        <volt-input readonly value="Read only" aria-label="Read only" />
      </div>`,
  }),
};

export const WithFormField: Story = {
  name: 'Validation with Form Field',
  parameters: {
    docs: {
      description: {
        story:
          'Inside a Form Field the label, hint and error are connected to the input. Focus the field and leave it empty to see the error.',
      },
    },
  },
  render: () => ({
    props: {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
    },
    template: `
      <volt-form-field class="max-w-sm">
        <volt-label>Email</volt-label>
        <volt-input [formControl]="email" type="email" placeholder="you@example.com" />
        <volt-hint>We’ll only use this for account updates.</volt-hint>
        @if (email.touched && email.invalid) {
          <volt-error>Enter a valid email address.</volt-error>
        }
      </volt-form-field>`,
  }),
};
