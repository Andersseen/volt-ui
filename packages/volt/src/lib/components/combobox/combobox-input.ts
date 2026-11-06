import { Directive, computed, input } from '@angular/core';
import { NgpComboboxInput } from 'ng-primitives/combobox';
import { cn } from '../../utils';

@Directive({
  selector: 'input[voltComboboxInput]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpComboboxInput,
      inputs: ['id'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
})
export class VoltComboboxInput {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'flex h-control-md w-full rounded-md border-(length:--volt-control-border-width) border-input bg-background pl-inset-sm pr-10 py-1 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-(length:--ring-width) focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      this.class()
    )
  );
}
