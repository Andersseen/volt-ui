import { cva, type VariantProps } from 'class-variance-authority';

export const paginationButtonVariants = cva(
  'inline-flex h-control-dense w-control-dense items-center justify-center rounded-md border-(length:--volt-control-border-width) text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
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
