import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline: 'border border-border bg-background text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 rounded-lg px-4 text-sm',
        lg: 'h-12 rounded-lg px-6 text-base',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Component({
  selector: 'button[volt-button], a[volt-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpButton],
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltButton {
  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');

  protected readonly classes = computed(() =>
    buttonVariants({ variant: this.variant(), size: this.size() }),
  );
}
