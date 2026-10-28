import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltSkeleton } from 'volt';
import { SKELETON_API } from '../../apps/web/src/app/lib/api-reference.generated';
import { variantArgTypes } from '../_helpers/api';

const meta: Meta<VoltSkeleton> = {
  title: 'Components/Display/Skeleton',
  component: VoltSkeleton,
  decorators: [moduleMetadata({ imports: [VoltSkeleton] })],
  argTypes: {
    ...variantArgTypes(SKELETON_API),
    width: { control: 'text' },
    height: { control: 'text' },
  },
  args: { variant: 'rectangle', width: '240px', height: '1rem' },
  render: args => ({
    props: args,
    template: `<volt-skeleton [variant]="variant" [width]="width" [height]="height" />`,
  }),
};
export default meta;
type Story = StoryObj<VoltSkeleton>;

export const Default: Story = {};

export const ProfileCard: Story = {
  name: 'Loading placeholder for a profile',
  parameters: {
    docs: {
      description: {
        story:
          'Skeletons are decorative. Mark the region that is loading with `aria-busy` and announce the real content when it arrives.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex items-center gap-4" aria-busy="true" aria-label="Loading profile">
        <volt-skeleton variant="circle" width="40px" height="40px" />
        <div class="space-y-2">
          <volt-skeleton variant="text" width="120px" height="16px" />
          <volt-skeleton variant="text" width="80px" height="14px" />
        </div>
      </div>`,
  }),
};
