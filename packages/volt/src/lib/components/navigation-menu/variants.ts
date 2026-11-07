import { cva, type VariantProps } from 'class-variance-authority';

/**
 * How the menu marks the current destination (`active` link, `aria-current="page"`).
 *
 * - `subtle` (default): a soft tint — the appearance every release before 1.4 had.
 * - `pill`: a filled, fully rounded primary surface.
 * - `underline`: a primary bar under the label; the bar's space is always there, so nothing moves.
 * - `outline`: a primary border; every item reserves a transparent one, so nothing resizes.
 *
 * "Open submenu" is a separate, interaction-only state (`data-open` on a trigger) and looks the
 * same in every variant: it is not a destination.
 */
export type VoltNavigationMenuVariant = 'subtle' | 'pill' | 'underline' | 'outline';

/**
 * The menu's own container.
 *
 * - `inline` (default): no surface; sits inside whatever header the application draws.
 * - `contained`: a self-sized, bordered surface for a centred or floating bar. It never grows past
 *   its content or the available width (it scrolls horizontally before it overflows).
 */
export type VoltNavigationMenuLayout = 'inline' | 'contained';

export const navigationMenuVariants = cva('relative flex items-center justify-center', {
  variants: {
    layout: {
      inline: 'max-w-max flex-1',
      contained:
        'w-fit max-w-full flex-none overflow-x-auto rounded-lg border-(length:--border-width) border-border bg-background p-1 text-foreground shadow-sm',
    },
    variant: {
      subtle: '',
      pill: '',
      underline: '',
      outline: '',
    },
  },
  compoundVariants: [{ layout: 'contained', variant: 'pill', class: 'rounded-full' }],
  defaultVariants: { layout: 'inline', variant: 'subtle' },
});

/**
 * Shared by top-level links and trigger buttons, so a link and a trigger side by side have the same
 * height, shape, hover, focus ring and disabled look. `data-[active]` only ever matches a link.
 */
export const navigationMenuItemVariants = cva(
  'relative inline-flex h-control-dense shrink-0 cursor-pointer select-none items-center justify-center gap-1 whitespace-nowrap px-inset-md text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:cursor-default data-[disabled]:opacity-50 data-[open]:bg-accent/50',
  {
    variants: {
      variant: {
        subtle:
          'rounded-md bg-transparent hover:bg-accent hover:text-accent-foreground data-[active]:bg-accent/50',
        pill: 'rounded-full bg-transparent hover:bg-accent hover:text-accent-foreground data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm data-[active]:hover:bg-primary/90 data-[active]:hover:text-primary-foreground',
        underline:
          'rounded-md bg-transparent text-muted-foreground after:pointer-events-none after:absolute after:inset-x-inset-md after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent after:transition-colors hover:text-foreground hover:after:bg-border data-[open]:text-foreground data-[active]:text-foreground data-[active]:after:bg-primary data-[active]:hover:after:bg-primary',
        outline:
          'rounded-md border-(length:--border-width) border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground data-[active]:border-primary data-[active]:text-foreground',
      },
    },
    defaultVariants: { variant: 'subtle' },
  }
);

export type NavigationMenuItemVariants = VariantProps<typeof navigationMenuItemVariants>;
