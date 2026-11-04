import { cva, type VariantProps } from 'class-variance-authority';

// `block`: the host is a custom (inline) element, which ignores `width` / `height` outside a flex or
// grid parent — the documented `<div class="space-y-2">` text lines painted 0×0 without it.
export const skeletonVariants = cva('block animate-pulse bg-muted', {
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
