import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltFileDropzone, VoltFileUpload, VoltNativeButton } from 'volt';

const meta: Meta<VoltFileDropzone> = {
  title: 'Components/Forms & Inputs/File Upload',
  component: VoltFileDropzone,
  decorators: [moduleMetadata({ imports: [VoltFileDropzone, VoltFileUpload, VoltNativeButton] })],
  argTypes: {
    multiple: { control: 'boolean' },
    directory: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fileTypes: { control: 'object' },
    selected: { action: 'selected' },
    rejected: { action: 'rejected' },
  },
  args: { multiple: true, directory: false, disabled: false, fileTypes: [] },
  render: args => ({
    props: args,
    template: `
      <volt-file-dropzone class="max-w-md" [multiple]="multiple" [directory]="directory" [disabled]="disabled" [fileTypes]="fileTypes" (selected)="selected($event)" (rejected)="rejected($event)">
        Drop files here
      </volt-file-dropzone>`,
  }),
};
export default meta;
type Story = StoryObj<VoltFileDropzone>;

export const Default: Story = {};

export const ImagesOnly: Story = {
  name: 'Restricted to images',
  parameters: {
    docs: {
      description: {
        story: 'Files that do not match `fileTypes` are reported through `(rejected)`.',
      },
    },
  },
  args: { multiple: false, fileTypes: ['image/*'] },
};

export const PickerDirective: Story = {
  name: 'Button with voltFileUpload',
  parameters: {
    docs: {
      description: {
        story: 'Put the `voltFileUpload` directive on any trigger when you do not want a dropzone.',
      },
    },
  },
  render: args => ({
    props: args,
    template: `<button voltButton variant="outline" type="button" voltFileUpload [multiple]="true" (selected)="selected($event)">Choose files…</button>`,
  }),
};
