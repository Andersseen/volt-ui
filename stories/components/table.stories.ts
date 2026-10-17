import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  VoltBadge,
  VoltTable,
  VoltTableBody,
  VoltTableCaption,
  VoltTableCell,
  VoltTableFooter,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
} from 'volt';

const INVOICES = [
  { id: 'INV001', status: 'Paid', method: 'Credit card', amount: 250 },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: 150 },
  { id: 'INV003', status: 'Unpaid', method: 'Bank transfer', amount: 350 },
  { id: 'INV004', status: 'Paid', method: 'Credit card', amount: 450 },
];

const meta: Meta<VoltTable> = {
  title: 'Components/Display/Table',
  component: VoltTable,
  decorators: [
    moduleMetadata({
      imports: [
        VoltTable,
        VoltTableCaption,
        VoltTableHeader,
        VoltTableBody,
        VoltTableFooter,
        VoltTableRow,
        VoltTableHead,
        VoltTableCell,
        VoltBadge,
      ],
    }),
  ],
  render: () => ({
    props: { invoices: INVOICES, total: INVOICES.reduce((sum, i) => sum + i.amount, 0) },
    template: `
      <volt-table>
        <volt-table-caption>A list of recent invoices.</volt-table-caption>
        <volt-table-header>
          <volt-table-row>
            <volt-table-head>Invoice</volt-table-head>
            <volt-table-head>Status</volt-table-head>
            <volt-table-head>Method</volt-table-head>
            <volt-table-head class="text-right">Amount</volt-table-head>
          </volt-table-row>
        </volt-table-header>
        <volt-table-body>
          @for (invoice of invoices; track invoice.id) {
            <volt-table-row>
              <volt-table-cell class="font-medium">{{ invoice.id }}</volt-table-cell>
              <volt-table-cell>
                <volt-badge [variant]="invoice.status === 'Paid' ? 'success' : invoice.status === 'Pending' ? 'warning' : 'destructive'">{{ invoice.status }}</volt-badge>
              </volt-table-cell>
              <volt-table-cell>{{ invoice.method }}</volt-table-cell>
              <volt-table-cell class="text-right">\${{ invoice.amount }}.00</volt-table-cell>
            </volt-table-row>
          }
        </volt-table-body>
        <volt-table-footer>
          <volt-table-row>
            <volt-table-cell colspan="3">Total</volt-table-cell>
            <volt-table-cell class="text-right">\${{ total }}.00</volt-table-cell>
          </volt-table-row>
        </volt-table-footer>
      </volt-table>`,
  }),
};
export default meta;
type Story = StoryObj<VoltTable>;

export const Default: Story = {};
