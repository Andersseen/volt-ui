import { cva, type VariantProps } from 'class-variance-authority';

// Status colour is carried by the tint and border; the text stays `text-foreground` so it keeps
// full contrast on every preset. Icons take the status colour where that token is >= 3:1 against
// the page in all presets (see scripts/contrast-audit.mjs). No warning token is, so the warning
// icon inherits the text colour.
export const alertVariants = cva(
  'relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm [&>[slot=icon]]:mt-0.5 [&>[slot=icon]]:size-4 [&>[slot=icon]]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-surface-foreground',
        info: 'border-info/40 bg-info/10 text-foreground [&>[slot=icon]]:text-info',
        success: 'border-success/40 bg-success/10 text-foreground [&>[slot=icon]]:text-success',
        warning: 'border-warning/50 bg-warning/10 text-foreground',
        destructive:
          'border-destructive/40 bg-destructive/10 text-foreground [&>[slot=icon]]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type AlertVariants = VariantProps<typeof alertVariants>;
