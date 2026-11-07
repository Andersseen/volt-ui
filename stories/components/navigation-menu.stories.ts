import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltNavigationMenu,
  VoltNavigationMenuContent,
  VoltNavigationMenuItem,
  VoltNavigationMenuLink,
  VoltNavigationMenuList,
  VoltNavigationMenuTrigger,
} from 'volt';

const meta: Meta<VoltNavigationMenu> = {
  title: 'Components/Navigation/Navigation Menu',
  component: VoltNavigationMenu,
  decorators: [
    moduleMetadata({
      imports: [
        VoltNavigationMenu,
        VoltNavigationMenuList,
        VoltNavigationMenuItem,
        VoltNavigationMenuTrigger,
        VoltNavigationMenuContent,
        VoltNavigationMenuLink,
      ],
    }),
  ],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'radio', options: ['subtle', 'pill', 'underline', 'outline'] },
    layout: { control: 'radio', options: ['inline', 'contained'] },
    showDelay: { control: 'number' },
    hideDelay: { control: 'number' },
    valueChange: { action: 'valueChange' },
  },
  args: {
    orientation: 'horizontal',
    showDelay: 200,
    hideDelay: 150,
    variant: 'subtle',
    layout: 'inline',
  },
  render: args => ({
    props: args,
    template: `
      <volt-navigation-menu aria-label="Main" [variant]="variant" [layout]="layout" [orientation]="orientation" [showDelay]="showDelay" [hideDelay]="hideDelay" (valueChange)="valueChange($event)">
        <volt-navigation-menu-list>
          <volt-navigation-menu-item>
            <volt-navigation-menu-trigger [content]="gettingStarted">Getting started</volt-navigation-menu-trigger>
            <ng-template #gettingStarted>
              <volt-navigation-menu-content>
                <a voltNavigationMenuLink href="#introduction">Introduction</a>
                <a voltNavigationMenuLink href="#installation">Installation</a>
              </volt-navigation-menu-content>
            </ng-template>
          </volt-navigation-menu-item>
          <volt-navigation-menu-item>
            <volt-navigation-menu-trigger [content]="components">Components</volt-navigation-menu-trigger>
            <ng-template #components>
              <volt-navigation-menu-content>
                <a voltNavigationMenuLink href="#button">Button</a>
                <a voltNavigationMenuLink href="#dialog">Dialog</a>
              </volt-navigation-menu-content>
            </ng-template>
          </volt-navigation-menu-item>
          <volt-navigation-menu-item>
            <a voltNavigationMenuLink href="#docs" [active]="true">Docs</a>
          </volt-navigation-menu-item>
        </volt-navigation-menu-list>
      </volt-navigation-menu>`,
  }),
};
export default meta;
type Story = StoryObj<VoltNavigationMenu>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each trigger’s panel is passed as a template reference to the required `content` input; projecting it instead throws, because the overlay renders it elsewhere.',
      },
    },
  },
};

export const Pill: Story = {
  args: { variant: 'pill' },
  parameters: {
    docs: {
      description: { story: 'A filled, fully rounded primary surface marks the current page.' },
    },
  },
};

export const Underline: Story = {
  args: { variant: 'underline' },
  parameters: {
    docs: {
      description: {
        story:
          'A primary bar under the current page. Its space is always reserved, so nothing moves.',
      },
    },
  },
};

export const Outline: Story = {
  args: { variant: 'outline' },
  parameters: {
    docs: {
      description: {
        story: 'A primary border. Every item reserves a transparent one, so nothing resizes.',
      },
    },
  },
};

export const Contained: Story = {
  args: { variant: 'pill', layout: 'contained' },
  parameters: {
    docs: {
      description: {
        story:
          'A self-sized, bordered surface for a centred or floating bar. `layout` and `variant` are independent.',
      },
    },
  },
};
