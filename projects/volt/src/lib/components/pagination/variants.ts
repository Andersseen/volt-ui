import { cva, type VariantProps } from 'class-variance-authority';

export const paginationButtonVariants = cva(
  'inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground data-[selected]:border-primary data-[selected]:bg-primary data-[selected]:text-primary-foreground',
        outline: 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type PaginationButtonVariants = VariantProps<typeof paginationButtonVariants>;
