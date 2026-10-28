import { cva, type VariantProps } from 'class-variance-authority';

export const spinnerVariants = cva(
  'inline-flex shrink-0 items-center justify-center text-current [&>svg]:size-full [&>svg]:animate-spin motion-reduce:[&>svg]:[animation-duration:1.5s]',
  {
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-8',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type SpinnerVariants = VariantProps<typeof spinnerVariants>;
