import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpNativeSelect, provideNativeSelectState } from 'ng-primitives/select';

@Directive({
  selector: 'select[voltNativeSelect]',
  standalone: true,
  hostDirectives: [{ directive: NgpNativeSelect, inputs: ['ngpNativeSelectDisabled: disabled'] }],
  providers: [provideNativeSelectState()],
  host: {
    class:
      'flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  },
})
export class VoltNativeSelect {
  readonly disabled = input(false, { transform: booleanAttribute });
}
