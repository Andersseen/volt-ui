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
      'flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      this.class()
    )
  );
}
