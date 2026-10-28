import { cva, type VariantProps } from 'class-variance-authority';

export const skeletonVariants = cva('animate-pulse bg-muted', {
  variants: {
    variant: {
      circle: 'rounded-full',
      rectangle: 'rounded-md',
      text: 'rounded-md',
    },
  },
  defaultVariants: {
    variant: 'rectangle',
  },
});

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;
