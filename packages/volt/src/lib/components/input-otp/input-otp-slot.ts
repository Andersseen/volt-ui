import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpInputOtpSlot } from 'ng-primitives/input-otp';
import { cn } from '../../utils';

@Component({
  selector: 'volt-input-otp-slot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpInputOtpSlot],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltInputOtpSlot {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'relative flex h-control-md w-control-md items-center justify-center rounded-md border-(length:--volt-control-border-width) border-input bg-background text-sm font-medium text-foreground transition-all focus-within:ring-(length:--ring-width) focus-within:ring-ring focus-within:ring-offset-(length:--ring-offset-width) data-[active]:ring-(length:--ring-width) data-[active]:ring-ring data-[active]:ring-offset-(length:--ring-offset-width) data-[filled]:border-primary data-[filled]:bg-primary/5',
      this.class()
    )
  );
}
