import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpToggleGroupItem, provideToggleGroupItemState } from 'ng-primitives/toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { computed } from '@angular/core';

export const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:shadow-sm',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground',
      },
      size: {
        sm: 'h-7 px-2 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type ToggleGroupItemVariants = VariantProps<typeof toggleGroupItemVariants>;

@Component({
  selector: 'volt-toggle-group-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideToggleGroupItemState()],
  host: {
    class: 'inline-flex',
  },
  hostDirectives: [
    {
      directive: NgpToggleGroupItem,
      inputs: ['ngpToggleGroupItemValue: value', 'ngpToggleGroupItemDisabled: disabled'],
    },
  ],
  template: `
    <button [class]="classes()" type="button">
      <ng-content />
    </button>
  `,
})
export class VoltToggleGroupItem {
  readonly value = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly variant = input<ToggleGroupItemVariants['variant']>('default');
  readonly size = input<ToggleGroupItemVariants['size']>('md');

  protected readonly classes = computed(() =>
    toggleGroupItemVariants({ variant: this.variant(), size: this.size() })
  );
}
