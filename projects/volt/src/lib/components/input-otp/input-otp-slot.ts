import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpInputOtpSlot } from 'ng-primitives/input-otp';

@Component({
  selector: 'volt-input-otp-slot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpInputOtpSlot],
  host: {
    class:
      'relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-input bg-background text-sm font-medium transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2 data-[filled]:border-primary data-[filled]:bg-primary/5',
  },
  template: `<ng-content />`,
})
export class VoltInputOtpSlot {}
