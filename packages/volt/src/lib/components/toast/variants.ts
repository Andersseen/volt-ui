import { cva, type VariantProps } from 'class-variance-authority';

export const toastVariants = cva(
  'pointer-events-auto relative flex w-full max-w-sm items-center justify-between gap-panel overflow-hidden rounded-md border-(length:--border-width) p-panel shadow-lg',
  {
    variants: {
      variant: {
        default: 'border-input bg-background text-foreground',
        success: 'border-success/40 bg-success/10 text-foreground',
        error: 'border-error/40 bg-error/10 text-foreground',
        warning: 'border-warning/40 bg-warning/10 text-foreground',
        info: 'border-info/40 bg-info/10 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type ToastVariants = VariantProps<typeof toastVariants>;
