import { cva, type VariantProps } from 'class-variance-authority';

export const textareaVariants = cva(
  'flex w-full rounded-md text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-border bg-background focus-visible:ring-ring',
        filled: 'bg-muted border-transparent focus-visible:ring-ring focus-visible:bg-background',
        ghost: 'bg-transparent border-transparent focus-visible:ring-ring focus-visible:bg-muted',
      },
      size: {
        sm: 'min-h-[60px] px-4 py-2 text-sm',
        md: 'min-h-[80px] px-4 py-2 text-sm',
        lg: 'min-h-[120px] px-6 py-3 text-base',
      },
      state: {
        default: '',
        error: 'border-error focus-visible:ring-error placeholder:text-error/70',
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
