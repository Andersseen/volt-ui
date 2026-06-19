import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgpToggleGroupItem, provideToggleGroupItemState } from 'ng-primitives/toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';

export const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
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
  imports: [NgpToggleGroupItem],
  host: {
    class: 'inline-flex',
  },
  template: `
    <button
      ngpToggleGroupItem
      [ngpToggleGroupItemValue]="value()"
      [ngpToggleGroupItemDisabled]="disabled()"
      [class]="classes()"
      type="button"
    >
      <ng-content />
    </button>
  `,
})
export class VoltToggleGroupItem {
  readonly value = input.required<string>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly variant = input<ToggleGroupItemVariants['variant']>('default');
  readonly size = input<ToggleGroupItemVariants['size']>('md');

  protected readonly classes = computed(() =>
    toggleGroupItemVariants({ variant: this.variant(), size: this.size() })
  );
}
