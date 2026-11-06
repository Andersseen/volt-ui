import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap border-(length:--volt-control-border-width) border-transparent font-medium transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring focus-visible:ring-offset-(length:--ring-offset-width) data-[disabled]:pointer-events-none data-[disabled]:opacity-50 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed cursor-pointer select-none',
  {
    variants: {
      variant: {
        solid:
          'border-(color:--volt-control-solid-border) bg-primary text-primary-foreground shadow-sm data-[hover]:bg-primary/90 data-[press]:scale-(--volt-press-scale) data-[press]:translate-x-(--volt-press-x) data-[press]:translate-y-(--volt-press-y) data-[press]:shadow-none',
        destructive:
          'border-(color:--volt-control-solid-border) bg-destructive text-destructive-foreground shadow-sm data-[hover]:bg-destructive/90 data-[press]:scale-(--volt-press-scale) data-[press]:translate-x-(--volt-press-x) data-[press]:translate-y-(--volt-press-y) data-[press]:shadow-none',
        outline:
          'border-input bg-background shadow-sm data-[hover]:bg-accent data-[hover]:text-accent-foreground data-[press]:scale-(--volt-press-scale) data-[press]:translate-x-(--volt-press-x) data-[press]:translate-y-(--volt-press-y) data-[press]:shadow-none',
        ghost: 'data-[hover]:bg-accent data-[hover]:text-accent-foreground',
        link: 'text-primary underline-offset-4 data-[hover]:underline',
      },
      size: {
        sm: 'h-control-sm rounded-md px-inset-sm text-xs',
        md: 'h-control-md rounded-md px-inset-md text-sm',
        lg: 'h-control-lg rounded-md px-inset-lg text-base',
        icon: 'h-control-dense w-control-dense rounded-md',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
