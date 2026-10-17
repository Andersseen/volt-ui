import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltBreadcrumbEllipsis,
  VoltBreadcrumbItem,
  VoltBreadcrumbLink,
  VoltBreadcrumbList,
  VoltBreadcrumbPage,
  VoltBreadcrumbSeparator,
  VoltBreadcrumbs,
  VoltNativeBreadcrumbLink,
} from 'volt';

const meta: Meta<VoltBreadcrumbs> = {
  title: 'Components/Navigation/Breadcrumbs',
  component: VoltBreadcrumbs,
  decorators: [
    moduleMetadata({
      imports: [
        VoltBreadcrumbs,
        VoltBreadcrumbList,
        VoltBreadcrumbItem,
        VoltBreadcrumbLink,
        VoltNativeBreadcrumbLink,
        VoltBreadcrumbPage,
        VoltBreadcrumbSeparator,
        VoltBreadcrumbEllipsis,
      ],
    }),
  ],
  args: { ariaLabel: 'breadcrumb' },
  render: args => ({
    props: args,
    template: `
      <volt-breadcrumbs [ariaLabel]="ariaLabel">
        <volt-breadcrumb-list>
          <volt-breadcrumb-item><volt-breadcrumb-link href="#home">Home</volt-breadcrumb-link></volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item><volt-breadcrumb-link href="#docs">Docs</volt-breadcrumb-link></volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item><volt-breadcrumb-page>Components</volt-breadcrumb-page></volt-breadcrumb-item>
        </volt-breadcrumb-list>
      </volt-breadcrumbs>`,
  }),
};
export default meta;
type Story = StoryObj<VoltBreadcrumbs>;

export const Default: Story = {};

export const WithEllipsis: Story = {
  name: 'Collapsed path',
  render: () => ({
    template: `
      <volt-breadcrumbs>
        <volt-breadcrumb-list>
          <volt-breadcrumb-item><volt-breadcrumb-link href="#home">Home</volt-breadcrumb-link></volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item><volt-breadcrumb-ellipsis /></volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item><volt-breadcrumb-link href="#components">Components</volt-breadcrumb-link></volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item><volt-breadcrumb-page>Breadcrumbs</volt-breadcrumb-page></volt-breadcrumb-item>
        </volt-breadcrumb-list>
      </volt-breadcrumbs>`,
  }),
};

export const NativeLink: Story = {
  name: 'Your own anchor (router links)',
  parameters: {
    docs: {
      description: {
        story:
          '`<a voltBreadcrumbLink>` styles the anchor you write, so `routerLink` or any other anchor directive can own it. Volt never imports the router.',
      },
    },
  },
  render: () => ({
    template: `
      <volt-breadcrumbs>
        <volt-breadcrumb-list>
          <volt-breadcrumb-item><a voltBreadcrumbLink href="#home">Home</a></volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item><volt-breadcrumb-page>Current page</volt-breadcrumb-page></volt-breadcrumb-item>
        </volt-breadcrumb-list>
      </volt-breadcrumbs>`,
  }),
};
