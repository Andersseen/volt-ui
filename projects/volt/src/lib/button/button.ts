import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  booleanAttribute,
} from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        solid:
          'bg-primary text-primary-foreground shadow-sm data-[hover]:bg-primary/90 data-[press]:scale-[0.98]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm data-[hover]:bg-destructive/90 data-[press]:scale-[0.98]',
        outline:
          'border border-input bg-background shadow-sm data-[hover]:bg-accent data-[hover]:text-accent-foreground',
        ghost: 'data-[hover]:bg-accent data-[hover]:text-accent-foreground',
        link: 'text-primary underline-offset-4 data-[hover]:underline',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 rounded-md px-4 text-sm',
        lg: 'h-11 rounded-md px-8 text-base',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Component({
  selector: 'volt-button',
  standalone: true,
  imports: [NgpButton],
  hostDirectives: [
    {
      directive: NgpButton,
      inputs: ['disabled'],
    },
  ],
  template: `
    <ng-content select="[slot=leading]" />
    <ng-content />
    <ng-content select="[slot=trailing]" />
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',

    '[attr.disabled]': 'disabled() ? true : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoltButton {
  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');

  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    buttonVariants({ variant: this.variant(), size: this.size() }),
  );
}
