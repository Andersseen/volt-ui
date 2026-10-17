import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoltError, VoltFormField, VoltHint, VoltInput, VoltLabel, VoltTextarea } from 'volt';

const meta: Meta<VoltFormField> = {
  title: 'Components/Forms & Inputs/Form Field',
  component: VoltFormField,
  decorators: [
    moduleMetadata({
      imports: [
        VoltFormField,
        VoltLabel,
        VoltHint,
        VoltError,
        VoltInput,
        VoltTextarea,
        ReactiveFormsModule,
      ],
    }),
  ],
  render: () => ({
    template: `
      <volt-form-field class="max-w-sm">
        <volt-label>Project name</volt-label>
        <volt-input placeholder="my-project" />
        <volt-hint>Lowercase letters and dashes.</volt-hint>
      </volt-form-field>`,
  }),
};
export default meta;
type Story = StoryObj<VoltFormField>;

export const Default: Story = {};

export const WithError: Story = {
  name: 'With validation error',
  parameters: {
    docs: {
      description: {
        story:
          'The error appears once the control is touched and invalid. Click into the field and tab away.',
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

export const Textarea: Story = {
  render: () => ({
    template: `
      <volt-form-field class="max-w-sm">
        <volt-label>Bio</volt-label>
        <volt-textarea rows="3" />
        <volt-hint>Tell people a little about yourself.</volt-hint>
      </volt-form-field>`,
  }),
};

export const OutsideFormField: Story = {
  name: 'Label without a Form Field',
  parameters: {
    docs: {
      description: {
        story: 'Outside a Form Field, point the label at the control with `htmlFor`.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex max-w-sm flex-col gap-2">
        <volt-label htmlFor="team">Team</volt-label>
        <volt-input id="team" size="sm" />
      </div>`,
  }),
};
