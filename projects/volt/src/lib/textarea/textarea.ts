import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { NgpTextarea } from 'ng-primitives/textarea';
import { cva, type VariantProps } from 'class-variance-authority';

export const textareaVariants = cva(
  'flex w-full rounded-md text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[var(--ring-width)] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-[var(--border)] bg-[var(--background)] focus-visible:ring-[var(--ring)]',
        filled:
          'bg-[var(--muted)] border-transparent focus-visible:ring-[var(--ring)] focus-visible:bg-[var(--background)]',
        ghost:
          'bg-transparent border-transparent focus-visible:ring-[var(--ring)] focus-visible:bg-[var(--muted)]',
      },
      size: {
        sm: 'min-h-[60px] px-[var(--spacing-component)] py-2 text-sm',
        md: 'min-h-[80px] px-[var(--spacing-component)] py-2 text-sm',
        lg: 'min-h-[120px] px-[calc(var(--spacing-component)*1.5)] py-3 text-base',
      },
      state: {
        default: '',
        error:
          'border-[var(--error)] focus-visible:ring-[var(--error)] placeholder:text-[var(--error)]/70',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  },
);

export type TextareaVariants = VariantProps<typeof textareaVariants>;

@Component({
  selector: 'volt-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpTextarea],
  template: `
    <textarea
      ngpTextarea
      [disabled]="disabled()"
      [class]="classes()"
      [attr.aria-invalid]="state() === 'error' ? 'true' : null"
      [style.resize]="resize()"
      [attr.rows]="rows()"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
    ></textarea>
  `,
})
export class VoltTextarea {
  readonly variant = input<TextareaVariants['variant']>('default');
  readonly size = input<TextareaVariants['size']>('md');
  readonly state = input<TextareaVariants['state']>('default');
  readonly resize = input<'none' | 'vertical' | 'horizontal' | 'both'>('vertical');
  readonly rows = input<number>(3);
  readonly disabled = input<boolean>(false);
  readonly value = model('');

  protected readonly classes = computed(() =>
    textareaVariants({
      variant: this.variant(),
      size: this.size(),
      state: this.state(),
    }),
  );
}
