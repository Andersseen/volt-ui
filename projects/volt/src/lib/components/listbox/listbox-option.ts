import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpListboxOption } from 'ng-primitives/listbox';
import { cva, type VariantProps } from 'class-variance-authority';

export const listboxOptionVariants = cva(
  'relative flex min-h-8 cursor-pointer select-none items-center rounded-[var(--radius-sm)] px-2 py-1.5 text-sm outline-none transition-colors data-[active]:bg-accent data-[active]:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
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

@Component({
  selector: 'volt-listbox-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpListboxOption,
      inputs: ['id', 'ngpListboxOptionValue: value', 'ngpListboxOptionDisabled: disabled'],
    },
  ],
  host: {
    class: 'contents',
  },
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class VoltListboxOption<T = unknown> {
  readonly id = input<string>();
  readonly value = input.required<T>();
  readonly disabled = input<boolean>(false);
  readonly inset = input<ListboxOptionVariants['inset']>(false);

  protected readonly classes = computed(() => listboxOptionVariants({ inset: this.inset() }));
}
