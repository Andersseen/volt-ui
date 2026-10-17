import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { VoltAvatar, VoltAvatarFallback, VoltAvatarImage } from 'volt';

// An inline image keeps the story offline-safe; any URL works the same way.
const PIXEL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%238b5cf6'/><text x='40' y='52' font-size='34' text-anchor='middle' fill='white' font-family='sans-serif'>V</text></svg>";

const meta: Meta<VoltAvatar> = {
  title: 'Components/Display/Avatar',
  component: VoltAvatar,
  decorators: [moduleMetadata({ imports: [VoltAvatar, VoltAvatarImage, VoltAvatarFallback] })],
  render: () => ({
    props: { src: PIXEL },
    template: `
      <volt-avatar>
        <img voltAvatarImage [src]="src" alt="Volt UI" />
        <volt-avatar-fallback>VU</volt-avatar-fallback>
      </volt-avatar>`,
  }),
};
export default meta;
type Story = StoryObj<VoltAvatar>;

export const Default: Story = {};

export const Fallback: Story = {
  name: 'Fallback initials',
  parameters: {
    docs: {
      description: {
        story:
          'When the image is missing or fails to load, the fallback is shown. `delay` waits before showing it to avoid a flash on fast connections.',
      },
    },
  },
  render: () => ({
    template: `
      <volt-avatar>
        <img voltAvatarImage src="/does-not-exist.png" alt="" />
        <volt-avatar-fallback>AB</volt-avatar-fallback>
      </volt-avatar>`,
  }),
};

export const Group: Story = {
  name: 'Overlapping group',
  render: () => ({
    template: `
      <div class="flex -space-x-2">
        <volt-avatar class="ring-background ring-2"><volt-avatar-fallback>AB</volt-avatar-fallback></volt-avatar>
        <volt-avatar class="ring-background ring-2"><volt-avatar-fallback>CD</volt-avatar-fallback></volt-avatar>
        <volt-avatar class="ring-background ring-2"><volt-avatar-fallback>EF</volt-avatar-fallback></volt-avatar>
      </div>`,
  }),
};
