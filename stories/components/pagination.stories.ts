import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltPagination,
  VoltPaginationButton,
  VoltPaginationFirst,
  VoltPaginationLast,
  VoltPaginationNext,
  VoltPaginationPrevious,
} from 'volt';

const meta: Meta<VoltPagination> = {
  title: 'Components/Controls/Pagination',
  component: VoltPagination,
  decorators: [
    moduleMetadata({
      imports: [
        VoltPagination,
        VoltPaginationButton,
        VoltPaginationFirst,
        VoltPaginationLast,
        VoltPaginationNext,
        VoltPaginationPrevious,
      ],
    }),
  ],
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    pageCount: { control: { type: 'number', min: 1 } },
    disabled: { control: 'boolean' },
    pageChange: { action: 'pageChange' },
  },
  args: { page: 1, pageCount: 5, disabled: false },
  render: args => ({
    props: args,
    template: `
      <volt-pagination aria-label="Pagination" [page]="page" [pageCount]="pageCount" [disabled]="disabled" (pageChange)="pageChange($event)">
        <volt-pagination-first />
        <volt-pagination-previous />
        <volt-pagination-button [page]="1" />
        <volt-pagination-button [page]="2" />
        <volt-pagination-button [page]="3" />
        <volt-pagination-next />
        <volt-pagination-last />
      </volt-pagination>`,
  }),
};
export default meta;
type Story = StoryObj<VoltPagination>;

export const Default: Story = {};

export const Outline: Story = {
  render: args => ({
    props: args,
    template: `
      <volt-pagination aria-label="Pagination" [page]="page" [pageCount]="pageCount" (pageChange)="pageChange($event)">
        <volt-pagination-previous />
        <volt-pagination-button [page]="1" variant="outline" />
        <volt-pagination-button [page]="2" variant="outline" />
        <volt-pagination-button [page]="3" variant="outline" />
        <volt-pagination-next />
      </volt-pagination>`,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
};
