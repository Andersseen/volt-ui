import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'input[volt-input]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgpInput, inputs: ['disabled'] }],
  host: {
    class:
      'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  },
  template: ``,
})
export class VoltInput {}
