import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  booleanAttribute,
} from '@angular/core';
import { cn } from '../../utils';
import { NgpButton } from 'ng-primitives/button';
import { buttonVariants, type ButtonVariants } from './variants';

@Component({
  selector: 'volt-button',
  imports: [NgpButton],
  template: `
    <button
      ngpButton
      [type]="type()"
      [disabled]="disabled()"
      [class]="classes()"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
    >
      <ng-content select="[slot=leading]" />
      <ng-content />
      <ng-content select="[slot=trailing]" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoltButton {
  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly class = input<string>('');
  readonly customClass = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      buttonVariants({ variant: this.variant(), size: this.size() }),
      this.class(),
      this.customClass()
    )
  );
}
