import { cva, type VariantProps } from 'class-variance-authority';

export const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center rounded-sm px-inset-sm py-item-y text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring focus-visible:ring-offset-(length:--ring-offset-width) data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:shadow-sm',
        outline:
          'border-(length:--volt-control-border-width) border-input bg-background hover:bg-accent hover:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground',
      },
      size: {
        sm: 'h-control-xs px-inset-xs text-xs',
        md: 'h-control-dense px-inset-sm text-sm',
        lg: 'h-control-md px-inset-md text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type ToggleGroupItemVariants = VariantProps<typeof toggleGroupItemVariants>;
