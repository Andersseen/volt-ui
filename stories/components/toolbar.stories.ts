import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltToolbar, VoltToolbarButton } from 'volt';

const meta: Meta<VoltToolbar> = {
  title: 'Components/Controls/Toolbar',
  component: VoltToolbar,
  decorators: [moduleMetadata({ imports: [VoltToolbar, VoltToolbarButton] })],
  argTypes: { orientation: { control: 'radio', options: ['horizontal', 'vertical'] } },
  args: { orientation: 'horizontal' },
  render: args => {
    const bold = signal(false);
    const italic = signal(false);
    return {
      props: { ...args, bold, italic },
      template: `
        <volt-toolbar aria-label="Formatting" [orientation]="orientation">
          <button voltToolbarButton type="button" [attr.aria-pressed]="bold()" (click)="bold.set(!bold())">Bold</button>
          <button voltToolbarButton type="button" [attr.aria-pressed]="italic()" (click)="italic.set(!italic())">Italic</button>
          <button voltToolbarButton type="button">Save</button>
        </volt-toolbar>
        <p class="text-muted-foreground mt-2 text-sm">Tab once to enter the toolbar, then use the arrow keys.</p>`,
    };
  },
};
export default meta;
type Story = StoryObj<VoltToolbar>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};
