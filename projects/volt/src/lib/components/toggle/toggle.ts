import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { NgpToggle } from 'ng-primitives/toggle';
import { cva, type VariantProps } from 'class-variance-authority';

export const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-muted data-[selected]:text-foreground cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-border bg-transparent hover:bg-muted hover:text-foreground data-[selected]:bg-transparent data-[selected]:text-foreground',
        ghost: 'bg-transparent hover:bg-muted hover:text-foreground data-[selected]:bg-muted',
        solid:
          'bg-background hover:bg-muted data-[selected]:bg-primary data-[selected]:text-primary-foreground',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;

@Component({
  selector: 'volt-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpToggle],
  template: `
    <button
      ngpToggle
      [ngpToggleDisabled]="disabled()"
      [ngpToggleSelected]="pressed()"
      (ngpToggleSelectedChange)="pressed.set($event)"
      [class]="classes()"
      [attr.data-disabled]="disabled() ? '' : null"
    >
      <ng-content />
    </button>
  `,
})
export class VoltToggle {
  readonly variant = input<ToggleVariants['variant']>('default');
  readonly size = input<ToggleVariants['size']>('md');
  readonly disabled = input<boolean>(false);
  readonly pressed = model<boolean>(false);

  protected readonly classes = computed(() =>
    toggleVariants({
      variant: this.variant(),
      size: this.size(),
    })
  );
}
