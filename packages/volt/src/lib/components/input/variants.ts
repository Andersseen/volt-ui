import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  'flex w-full rounded-md border-(length:--volt-control-border-width) border-input bg-background text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:focus-visible:ring-error',
  {
    variants: {
      size: {
        sm: 'h-control-sm px-inset-xs py-1 text-sm',
        md: 'h-control-md px-inset-sm py-2 text-sm',
        lg: 'h-control-lg px-inset-md py-2 text-base',
      },
      state: {
        default: '',
        error: 'border-error focus-visible:ring-error',
        success: 'border-success focus-visible:ring-success',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;
