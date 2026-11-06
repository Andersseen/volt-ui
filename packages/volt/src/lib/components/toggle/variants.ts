import { cva, type VariantProps } from 'class-variance-authority';

export const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring focus-visible:ring-offset-(length:--ring-offset-width) data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:bg-primary/15 data-[selected]:text-foreground cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border-(length:--volt-control-border-width) border-border bg-transparent hover:bg-muted hover:text-foreground data-[selected]:border-primary data-[selected]:bg-primary/10 data-[selected]:text-foreground',
        ghost:
          'bg-transparent hover:bg-muted hover:text-foreground data-[selected]:bg-primary/15 data-[selected]:text-foreground',
        solid:
          'bg-background hover:bg-muted data-[selected]:bg-primary data-[selected]:text-primary-foreground',
      },
      size: {
        sm: 'h-control-sm px-inset-xs text-xs',
        md: 'h-control-md px-inset-sm text-sm',
        lg: 'h-control-lg px-inset-md text-base',
        icon: 'h-control-md w-control-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;
