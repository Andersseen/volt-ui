import { cva, type VariantProps } from 'class-variance-authority';

export const listboxOptionVariants = cva(
  'relative flex min-h-control-sm cursor-pointer select-none items-center rounded-sm px-inset-xs py-item-y text-sm outline-none transition-colors data-[active]:bg-accent data-[active]:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      inset: {
        true: 'pl-8',
        false: '',
      },
    },
    defaultVariants: {
      inset: false,
    },
  }
);

export type ListboxOptionVariants = VariantProps<typeof listboxOptionVariants>;
