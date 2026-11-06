import { cva, type VariantProps } from 'class-variance-authority';

export const textareaVariants = cva(
  'flex w-full rounded-md text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-(length:--ring-width) disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:focus-visible:ring-error',
  {
    variants: {
      variant: {
        default:
          'border-(length:--volt-control-border-width) border-border bg-background focus-visible:ring-ring',
        filled: 'bg-muted border-transparent focus-visible:ring-ring focus-visible:bg-background',
        ghost: 'bg-transparent border-transparent focus-visible:ring-ring focus-visible:bg-muted',
      },
      size: {
        sm: 'min-h-[60px] px-inset-md py-2 text-sm',
        md: 'min-h-[80px] px-inset-md py-2 text-sm',
        lg: 'min-h-[120px] px-inset-md py-inset-sm text-base',
      },
      state: {
        default: '',
        error: 'border-error focus-visible:ring-error placeholder:text-error/70',
        success: 'border-success focus-visible:ring-success',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

export type TextareaVariants = VariantProps<typeof textareaVariants>;
