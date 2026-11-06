import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { NgpNativeSelect, provideNativeSelectState } from 'ng-primitives/select';
import { cn } from '../../utils';

@Directive({
  selector: 'select[voltNativeSelect]',
  standalone: true,
  hostDirectives: [{ directive: NgpNativeSelect, inputs: ['ngpNativeSelectDisabled: disabled'] }],
  providers: [provideNativeSelectState()],
  host: {
    '[class]': 'classes()',
  },
})
export class VoltNativeSelect {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'flex h-control-md w-full cursor-pointer rounded-md border-(length:--volt-control-border-width) border-input bg-background px-inset-sm py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      this.class()
    )
  );
}
